/**
 * Encodes a Lambda function name for use in a URL path segment.
 * This is the ONLY place in the feature that performs this encoding.
 */
export function encodeFunctionNameForRoute(name: string): string {
  return encodeURIComponent(name);
}

/**
 * Decodes a URL path segment back to a Lambda function name.
 * This is the ONLY place in the feature that performs this decoding.
 */
export function decodeFunctionNameParam(param: string): string {
  return decodeURIComponent(param);
}
