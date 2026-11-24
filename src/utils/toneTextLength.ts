export const TONE_TEXT_MAX_LENGTH = 3_000;

export function countToneTextCharacters(text: string): number {
  // Java String.length()와 textarea maxLength처럼 UTF-16 코드 단위를 셉니다.
  return text.length;
}
