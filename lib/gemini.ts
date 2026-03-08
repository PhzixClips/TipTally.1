import { ParsedShift } from './types';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

/**
 * Send a schedule photo to Gemini and get back parsed shifts.
 */
export async function parseScheduleImage(
  base64Image: string,
  roles: string[],
  apiKey: string,
): Promise<ParsedShift[]> {
  if (!apiKey) throw new Error('NO_API_KEY');

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];

  const systemPrompt = `You are a work schedule parser. Extract shift information from this schedule photo.
Return ONLY a valid JSON array of shift objects. Each object must have:
- "date": ISO date string "YYYY-MM-DD" (assume year ${currentYear} unless visible)
- "startTime": 12-hour format like "3:00 PM"
- "endTime": 12-hour format like "11:00 PM" (if visible, otherwise null)
- "role": the position/role if visible, otherwise "Unknown"
- "estimatedHours": number of hours (calculate from start/end if both visible, otherwise use 6)
- "confidence": "high" if date and time are clearly readable, "medium" if partially inferred, "low" if guessed

The employee's known roles are: ${roles.join(', ')}.
If a role on the schedule matches or is close to one of these, use the exact matching role name.
Today's date is ${currentDate} for reference.
Return ONLY the JSON array, no markdown fences, no explanation.`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: 'Extract all of my shifts from this schedule photo. Return them as a JSON array.',
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.1,
    },
  };

  let res: Response;
  try {
    res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('NETWORK_ERROR');
  }

  if (res.status === 400 || res.status === 403) throw new Error('INVALID_KEY');
  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error('API_ERROR');

  const json = await res.json();

  // Extract text from response
  const text: string | undefined =
    json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('EMPTY_RESPONSE');

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  let parsed: any[];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('PARSE_ERROR');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('NO_SHIFTS_FOUND');
  }

  // Validate and map to ParsedShift
  const shifts: ParsedShift[] = parsed
    .filter(
      (s: any) =>
        s.date &&
        typeof s.date === 'string' &&
        s.startTime &&
        typeof s.startTime === 'string',
    )
    .map((s: any) => ({
      date: s.date,
      startTime: s.startTime,
      role: typeof s.role === 'string' ? s.role : 'Unknown',
      estimatedHours:
        typeof s.estimatedHours === 'number' && s.estimatedHours > 0
          ? s.estimatedHours
          : 6,
      confidence: ['high', 'medium', 'low'].includes(s.confidence)
        ? s.confidence
        : 'medium',
    }));

  if (shifts.length === 0) throw new Error('NO_SHIFTS_FOUND');

  return shifts;
}

/**
 * Get a user-friendly error message.
 */
export function getErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : 'UNKNOWN';
  switch (msg) {
    case 'NO_API_KEY':
      return 'Set up your Gemini API key in Settings to use the scanner.';
    case 'INVALID_KEY':
      return 'Invalid API key. Check your Gemini API key in Settings.';
    case 'RATE_LIMITED':
      return 'Too many requests. Wait a moment and try again.';
    case 'NETWORK_ERROR':
      return 'No internet connection. Check your network and try again.';
    case 'EMPTY_RESPONSE':
    case 'PARSE_ERROR':
      return 'Could not read the schedule. Try a clearer photo.';
    case 'NO_SHIFTS_FOUND':
      return 'No shifts found in this image. Try a different photo.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
