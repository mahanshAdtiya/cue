export function fill(
  template: string,
  values: Record<string, string>,
): string {
  let text = template;

  for (const [token, value] of Object.entries(values)) {
    text = text.replaceAll(token, value);
  }

  return text;
}
