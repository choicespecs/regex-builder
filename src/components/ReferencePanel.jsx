import { useState } from 'react'
import './ReferencePanel.css'

const SECTIONS = [
  // ── 1. Anchors ────────────────────────────────────────────────────────────
  {
    id: 'anchors',
    title: 'Anchors',
    intro: 'Anchors match a position in the string, not a character. They are zero-width — they assert something about where you are without consuming any characters.',
    items: [
      {
        pattern: '^',
        name: 'Start of string / line',
        description: 'Asserts that the match must begin at the very start of the string. With the multiline flag (m), ^ instead matches the start of each line (after every \\n). Without m, ^ only fires once at position 0.',
        matches: ['/^hello/ matches "hello world"', '/^\\w+/gm on "foo\\nbar" → ["foo", "bar"]'],
        noMatch: ['/^hello/ does not match "say hello" (hello is not at position 0)'],
      },
      {
        pattern: '$',
        name: 'End of string / line',
        description: 'Asserts that the match must end at the very end of the string. With the multiline flag (m), $ matches the end of each line (before every \\n). Combine ^…$ to validate the entire string.',
        matches: ['/world$/ matches "hello world"', '/^\\d+$/ validates that the entire string is digits'],
        noMatch: ['/world$/ does not match "world domination" (something follows)'],
      },
      {
        pattern: '\\b',
        name: 'Word boundary',
        description: 'Matches the zero-width position between a word character (\\w = letter, digit, underscore) and a non-word character (space, punctuation, start/end of string). Essential for whole-word matching so "cat" does not fire inside "concatenate".',
        matches: ['/\\bcat\\b/ matches "cat" in "the cat sat"', '/\\bcat\\b/ matches "cat." (dot is non-word)'],
        noMatch: ['/\\bcat\\b/ does NOT match inside "concatenate" or "scat"'],
      },
      {
        pattern: '\\B',
        name: 'Non-word boundary',
        description: 'Matches a position that is NOT a word boundary — i.e. the cursor is inside a word. Useful for finding substrings that must not appear at a word edge.',
        matches: ['/\\Bcat\\B/ matches "cat" inside "concatenate"'],
        noMatch: ['/\\Bcat\\B/ does NOT match "cat" in "the cat" (it\'s at a boundary)'],
      },
    ],
  },

  // ── 2. Character Classes ──────────────────────────────────────────────────
  {
    id: 'charclasses',
    title: 'Character Classes',
    intro: 'Character classes match one character from a defined set. Shorthand classes like \\d, \\w, \\s are aliases for bracket expressions. Each matches exactly one character unless combined with a quantifier.',
    items: [
      {
        pattern: '.',
        name: 'Any character (dot)',
        description: 'Matches any single character except a newline (\\n). With the dotall flag (s), it also matches newlines. When you need to match truly any character, use [\\s\\S] — that always works regardless of the s flag.',
        matches: ['h.t matches "hat", "hit", "h3t", "h!t"'],
        noMatch: ['h.t does not match "h\\nt" (newline) without the s flag'],
      },
      {
        pattern: '\\d',
        name: 'Digit (ASCII)',
        description: 'Matches any ASCII digit: 0–9. Exactly equivalent to [0-9]. Note: \\d does NOT match digits in other scripts (Arabic-Indic, Devanagari, etc.) — use \\p{N} with the u flag for that.',
        matches: ['0', '7', '9 — any single ASCII digit'],
        noMatch: ["'a', ' ', '٣' (Arabic-Indic digit, needs \\p{N})"],
      },
      {
        pattern: '\\D',
        name: 'Non-digit',
        description: 'Matches any character that is NOT a digit [0-9]. The exact complement of \\d. Use \\D+ to match runs of non-digit characters.',
        matches: ['"a", " ", "!", "中" — anything that is not 0–9'],
        noMatch: ['"0" through "9"'],
      },
      {
        pattern: '\\w',
        name: 'Word character (ASCII)',
        description: 'Matches any ASCII letter (a–z, A–Z), digit (0–9), or underscore (_). Equivalent to [a-zA-Z0-9_]. Does NOT match accented letters (é, ñ) or non-Latin scripts — use \\p{L} for full Unicode.',
        matches: ['"a", "Z", "5", "_"'],
        noMatch: ['" ", "@", "-", "!", "é" — punctuation, spaces, or non-ASCII letters'],
      },
      {
        pattern: '\\W',
        name: 'Non-word character',
        description: 'Matches any character that is NOT in [a-zA-Z0-9_]. The complement of \\w. Useful for splitting on word boundaries or stripping punctuation.',
        matches: ['" ", "@", "-", "!", "é"'],
        noMatch: ['"a", "Z", "5", "_"'],
      },
      {
        pattern: '\\s',
        name: 'Whitespace',
        description: 'Matches any whitespace: space ( ), tab (\\t), newline (\\n), carriage return (\\r), form feed (\\f), vertical tab (\\v). Use \\S for the opposite — any non-whitespace character.',
        matches: ['" " (space)', '"\\t" (tab)', '"\\n" (newline)'],
        noMatch: ['Any visible character'],
      },
      {
        pattern: '\\S',
        name: 'Non-whitespace',
        description: 'Matches any character that is NOT whitespace — the complement of \\s. Use \\S+ to capture words or tokens separated by spaces.',
        matches: ['"a", "1", "@", "中" — any visible character'],
        noMatch: ['" " (space)', '"\\t" (tab)', '"\\n" (newline)'],
      },
      {
        pattern: '[abc]',
        name: 'Character set',
        description: 'Matches any ONE character from the set. List characters individually or use ranges. [a-z] = any lowercase ASCII letter. [A-Z] = uppercase. [0-9] = digit. [a-zA-Z0-9] = alphanumeric. Order inside brackets does not matter. A literal hyphen goes at the start or end: [-abc] or [abc-].',
        matches: ['[aeiou] matches "a", "e", "i", "o", "u"', '[0-9a-f] matches any hex digit'],
        noMatch: ['[aeiou] does not match "b", "c", "1"'],
      },
      {
        pattern: '[^abc]',
        name: 'Negated character set',
        description: 'A caret ^ immediately after the opening bracket means NOT. Matches any single character that is NOT listed. [^0-9] = any non-digit. [^\\n] = any character except newline. The caret is only special as the first character; elsewhere it is literal.',
        matches: ['[^aeiou] matches "b", "c", "1", " "'],
        noMatch: ['[^aeiou] does not match "a", "e", "i", "o", "u"'],
      },
    ],
  },

  // ── 3. Escape Sequences ───────────────────────────────────────────────────
  {
    id: 'escapes',
    title: 'Escape Sequences',
    intro: 'A backslash either gives a character special meaning (\\n = newline) or strips its special meaning (\\. = literal dot). These cover invisible characters, code points, and metacharacter literals.',
    items: [
      {
        pattern: '\\n  \\t  \\r  \\f  \\v',
        name: 'Whitespace control characters',
        description: '\\n = newline / line feed (LF, U+000A). \\t = horizontal tab (U+0009). \\r = carriage return (CR, U+000D — paired with \\n in Windows line endings). \\f = form feed (U+000C). \\v = vertical tab (U+000B). These mirror escape sequences in JavaScript string literals.',
        matches: ['/\\t/.test("\\t") → true', '/\\r?\\n/ matches both Unix (\\n) and Windows (\\r\\n) line endings'],
        noMatch: ['/\\n/.test("no newline here") → false'],
      },
      {
        pattern: '\\0',
        name: 'Null character (NUL)',
        description: 'Matches the null character (U+0000, ASCII 0). Appears in binary data and some C-string terminated formats. Do not follow \\0 with another digit — \\01 is an octal escape in older regex flavours.',
        matches: ['/\\0/.test("\\0") → true'],
        noMatch: [],
      },
      {
        pattern: '\\xHH',
        name: 'Hex code point (2 digits)',
        description: 'Matches the character at the given two-digit hex code point (00–FF), covering full ASCII and Latin-1. \\x41 = "A", \\x61 = "a", \\x20 = space, \\x0A = newline. Useful when the character is hard to type or display in source.',
        matches: ['/\\x41/.test("A") → true  (\\x41 = A)', '/\\x20/.test(" ") → true  (\\x20 = space)'],
        noMatch: [],
      },
      {
        pattern: '\\uHHHH',
        name: 'Unicode code point (4 hex digits)',
        description: 'Matches the Unicode character at the given four-hex-digit code point (U+0000–U+FFFF, the Basic Multilingual Plane). Works without any special flag. \\u0041 = "A", \\u00E9 = "é", \\u4E2D = "中", \\u1F600 does NOT work here (needs \\u{} form).',
        matches: ['/\\u00E9/.test("café") → true', '/\\u4E2D/.test("中文") → true'],
        noMatch: [],
      },
      {
        pattern: '\\u{H…}',
        name: 'Full code point (1–6 hex digits, u or v flag required)',
        description: 'Matches any Unicode code point, including those above U+FFFF — emoji, historic scripts, musical notation. Requires the u or v flag. Without it, the braces are interpreted as a quantifier and the match will be wrong or throw.',
        matches: ['/\\u{1F600}/u.test("😀") → true', '/\\u{1F4A9}/u.test("💩") → true', '/\\u{0041}/u.test("A") → true'],
        noMatch: ['/\\u{1F600}/ without u flag — wrong interpretation'],
      },
      {
        pattern: '\\.  \\*  \\+  \\?  \\^  \\$  \\(  \\)  \\[  \\]  \\{  \\}  \\|  \\\\',
        name: 'Escaping metacharacters',
        description: 'These 14 characters have special meaning in regex syntax. Prefix any of them with \\ to match them literally. The backslash itself is \\\\. In a JavaScript string literal you must double every backslash: "\\\\." is the two-char sequence \\. that the regex engine sees as "literal dot". Use String.raw`\\.` to avoid doubling.',
        matches: ['/\\./.test("3.14") → true  (literal dot)', '/\\$\\d+/.test("$100") → true'],
        noMatch: ['/./ matches any character, not just a literal dot'],
      },
    ],
  },

  // ── 4. Quantifiers ────────────────────────────────────────────────────────
  {
    id: 'quantifiers',
    title: 'Quantifiers',
    intro: 'Quantifiers control how many times the preceding element must appear. By default they are greedy — they match as many characters as possible while still allowing the overall pattern to succeed.',
    items: [
      {
        pattern: '{n}',
        name: 'Exactly n',
        description: 'The preceding element must appear exactly n times. \\d{4} matches exactly four digits.',
        matches: ['\\d{4} → "2024", "1234"'],
        noMatch: ['\\d{4} → "123" (only 3 digits)'],
      },
      {
        pattern: '{n,}',
        name: 'At least n',
        description: 'The preceding element must appear n or more times. \\d{3,} matches three or more consecutive digits.',
        matches: ['\\d{3,} → "123", "1234", "99999"'],
        noMatch: ['\\d{3,} → "12" (only 2 digits)'],
      },
      {
        pattern: '{n,m}',
        name: 'Between n and m',
        description: 'The preceding element must appear between n and m times, both endpoints inclusive. \\d{2,4} matches 2, 3, or 4 digits.',
        matches: ['\\d{2,4} → "12", "123", "1234"'],
        noMatch: ['\\d{2,4} → "1" (too few)'],
      },
      {
        pattern: '*',
        name: 'Zero or more',
        description: 'The preceding element may appear zero or more times. Equivalent to {0,}. Matches even when the element is absent entirely.',
        matches: ['go*d → "gd", "god", "good", "goood"'],
        noMatch: ['go*d → "gad" (wrong vowel)'],
      },
      {
        pattern: '+',
        name: 'One or more',
        description: 'The preceding element must appear at least once. Equivalent to {1,}. Unlike *, requires at least one match.',
        matches: ['go+d → "god", "good", "goood"'],
        noMatch: ['go+d → "gd" (no "o")'],
      },
      {
        pattern: '?',
        name: 'Zero or one (optional)',
        description: 'The preceding element is optional — 0 or 1 occurrence. Equivalent to {0,1}. Used for optional suffixes, prefixes, or alternate spellings.',
        matches: ['colou?r → "color", "colour"'],
        noMatch: ['colou?r → "colouur" (two u\'s)'],
      },
      {
        pattern: '*?  +?  ??  {n,m}?',
        name: 'Lazy (non-greedy) quantifiers',
        description: 'Adding ? after any quantifier makes it lazy: match as FEW characters as possible. Critical when matching between delimiters. Greedy <.+> on "<b>hi</b>" swallows the whole string. Lazy <.+?> stops at the first >.',
        matches: ['<.+?> on "<b>hi</b>" → "<b>", "</b>" (two matches)'],
        noMatch: ['<.+> (greedy) on "<b>hi</b>" → "<b>hi</b>" (one match, entire string)'],
      },
    ],
  },

  // ── 5. Groups & Capturing ─────────────────────────────────────────────────
  {
    id: 'groups',
    title: 'Groups & Capturing',
    intro: 'Groups treat a sequence as a single unit, apply quantifiers to multi-character patterns, extract sub-matches, and assert context via lookarounds.',
    items: [
      {
        pattern: '(abc)',
        name: 'Capturing group',
        description: 'Groups the pattern AND captures the matched text. Groups are numbered left-to-right by their opening parenthesis, starting at 1. Access with match[1], match[2], etc.',
        matches: ['(\\d{4})-(\\d{2}) on "2024-01" → match[1]="2024", match[2]="01"'],
        noMatch: [],
      },
      {
        pattern: '(?:abc)',
        name: 'Non-capturing group',
        description: 'Groups WITHOUT capturing. Use when you need grouping for alternation or quantifiers but do not want to pollute the match index. Slightly faster and keeps group numbering clean.',
        matches: ['(?:ab)+ matches "ab", "abab", "ababab" — group not in results'],
        noMatch: [],
      },
      {
        pattern: '(?<name>abc)',
        name: 'Named capture group',
        description: 'Captures and assigns a readable name. Access in JavaScript via match.groups.name. Named groups also appear as numbered groups. The name must start with a letter and contain only letters, digits, or underscores.',
        matches: ['(?<year>\\d{4})-(?<month>\\d{2}) → groups.year="2024", groups.month="01"'],
        noMatch: [],
      },
      {
        pattern: '\\1  \\2  …',
        name: 'Numeric backreference',
        description: 'Matches the same text already captured by group N. Reuses the captured string — does not re-run the pattern. Numbered by opening parenthesis position. Use to detect repeated words, paired delimiters, or symmetric structures.',
        matches: [
          '/(\\w+) \\1/ matches "hello hello" (same word twice)',
          '/([\'"]).*?\\1/ matches both \'single\' and "double" quoted strings',
        ],
        noMatch: ['/(\\w+) \\1/ does NOT match "hello world" (two different words)'],
      },
      {
        pattern: '\\k<name>',
        name: 'Named backreference',
        description: 'Matches the same text captured by the named group. More self-documenting than \\1 when a pattern has many groups. Named and numeric backreferences can coexist in the same pattern.',
        matches: [
          '/(?<q>[\'"]).*?\\k<q>/ matches \'single\' and "double" (same opening quote)',
          '/(?<word>\\w+) \\k<word>/ matches "bye bye"',
        ],
        noMatch: ['/(?<word>\\w+) \\k<word>/ does NOT match "hello world"'],
      },
      {
        pattern: 'a|b',
        name: 'Alternation (OR)',
        description: 'Matches the left side OR the right. The engine tries left first. Without grouping, cat|dogs matches "cat" or "dogs". With grouping, (cat|dog)s matches "cats" or "dogs". Longer alternatives should come first to avoid early exits.',
        matches: ['cat|dog matches "cat" and "dog"', '(https?|ftp)://… matches http, https, or ftp URLs'],
        noMatch: ['cat|dog does not match "fish"'],
      },
      {
        pattern: '(?=abc)',
        name: 'Positive lookahead',
        description: 'Asserts that the specified pattern follows the current position without including it in the match. Zero-width. "Match X only when followed by Y."',
        matches: ['\\d+(?= dollars) on "100 dollars" → matches "100" (not "dollars")'],
        noMatch: ['\\d+(?= dollars) on "100 euros" → no match'],
      },
      {
        pattern: '(?!abc)',
        name: 'Negative lookahead',
        description: 'Asserts that the specified pattern does NOT follow the current position. Zero-width. "Match X only when NOT followed by Y."',
        matches: ['\\d+(?! dollars) on "100 euros" → matches "100"'],
        noMatch: ['\\d+(?! dollars) on "100 dollars" → no match'],
      },
      {
        pattern: '(?<=abc)',
        name: 'Positive lookbehind',
        description: 'Asserts that the specified pattern precedes the current position, without including it in the match. Zero-width. Supported in modern JavaScript engines (ES2018+).',
        matches: ['(?<=\\$)\\d+ on "$100" → matches "100" (not the "$")'],
        noMatch: ['(?<=\\$)\\d+ on "€100" → no match'],
      },
      {
        pattern: '(?<!abc)',
        name: 'Negative lookbehind',
        description: 'Asserts that the specified pattern does NOT precede the current position. Zero-width.',
        matches: ['(?<!\\$)\\d+ on "€100" → matches "100"', '(?<!un)happy matches "happy" but not "unhappy"'],
        noMatch: ['(?<!\\$)\\d+ on "$100" → no match'],
      },
    ],
  },

  // ── 6. Flags ──────────────────────────────────────────────────────────────
  {
    id: 'flags',
    title: 'Flags',
    intro: 'Flags appear after the closing slash — /pattern/flags — and change how the entire regex behaves. Multiple flags can be combined in any order: /pattern/gim.',
    items: [
      {
        pattern: 'g',
        name: 'Global',
        description: 'Find ALL matches in the string instead of stopping after the first. The builder uses /g automatically. Without g, str.match() returns the first match with its capture groups. With g, it returns all full matches but drops capture groups — use matchAll() for all matches AND groups.',
        matches: ['/\\d+/g on "1 plus 2 equals 3" → ["1", "2", "3"]'],
        noMatch: ['/\\d+/ (no g) on same string → ["1"] only'],
      },
      {
        pattern: 'i',
        name: 'Case-insensitive',
        description: 'Makes letter matching case-insensitive. [a-z] also matches [A-Z] and vice versa. Does not affect \\d, \\s, or numeric ranges like [0-9]. Combine with u for proper Unicode case folding.',
        matches: ['/hello/i matches "hello", "Hello", "HELLO", "hElLo"'],
        noMatch: [],
      },
      {
        pattern: 'm',
        name: 'Multiline',
        description: 'Changes ^ and $ to match the start and end of each LINE rather than the entire string. The dot (.) still does not match newlines — add the s flag for that.',
        matches: ['/^\\w+/gm on "hello\\nworld" → ["hello", "world"]'],
        noMatch: ['/^\\w+/g (no m) on "hello\\nworld" → ["hello"] only'],
      },
      {
        pattern: 's',
        name: 'Dotall',
        description: 'Makes the dot (.) also match newline characters (\\n). Without this flag, . matches everything except \\n. Available in JavaScript since ES2018. For older environments, use [\\s\\S] as a workaround.',
        matches: ['/a.b/s matches "a\\nb" (newline between a and b)', '/BEGIN[\\s\\S]*?END/s matches content spanning multiple lines'],
        noMatch: ['/a.b/ (no s flag) does NOT match "a\\nb"'],
      },
      {
        pattern: 'd',
        name: 'Indices (hasIndices)',
        description: 'Adds a .indices property to every match result containing the [start, end] character positions of the full match and each capture group. Available in JavaScript since ES2022. Named group positions are in match.indices.groups.',
        matches: ['/(?<y>\\d{4})/d → match.indices.groups.y = [0, 4]'],
        noMatch: [],
      },
      {
        pattern: 'y',
        name: 'Sticky',
        description: 'Anchors each match attempt to exactly re.lastIndex. Unlike g, it does not scan forward — if there is no match at the current position it returns null immediately and resets lastIndex to 0. Designed for writing tokenisers that consume a string left to right without backtracking.',
        matches: [
          'const re = /\\d+/y',
          're.lastIndex = 4',
          're.exec("abc 123") → ["123"]  (match at index 4)',
          're.lastIndex = 0',
          're.exec("abc 123") → null    (position 0 is "a", not a digit)',
        ],
        noMatch: [],
      },
      {
        pattern: 'v',
        name: 'Unicode Sets (ES2024)',
        description: 'An upgrade to the u flag with three extras: (1) set operations — [A--B] difference, [A&&B] intersection; (2) nested classes like [\\p{L}&&[^\\p{ASCII}]]; (3) string property escapes such as \\p{RGI_Emoji} which matches full multi-codepoint emoji sequences as one unit. v and u are mutually exclusive.',
        matches: [
          '/[\\p{L}&&[^\\p{ASCII}]]/v matches "é", "ñ", "中" (non-ASCII letters)',
          '/\\p{RGI_Emoji}/v matches "👨‍👩‍👧" as one unit',
        ],
        noMatch: [],
      },
    ],
  },

  // ── 7. Unicode & Property Escapes ─────────────────────────────────────────
  {
    id: 'unicode',
    title: 'Unicode & Property Escapes',
    intro: 'With the u or v flag, \\p{Property} matches any Unicode character that has the given property. This is the correct way to match "any letter" or "any digit" across all human writing systems — \\w and \\d only cover ASCII.',
    items: [
      {
        pattern: '\\p{L}  or  \\p{Letter}',
        name: 'Any letter (all scripts)',
        description: 'Matches any character classified as a letter in Unicode — Latin, Cyrillic, Arabic, CJK, Devanagari, Hebrew, Thai, and hundreds more. \\P{L} (uppercase P) matches any NON-letter. Requires the u or v flag.',
        matches: ['/\\p{L}+/u.test("café") → true', '/\\p{L}+/u.test("中文") → true', '/\\p{L}+/u.test("123") → false (digits)'],
        noMatch: [],
      },
      {
        pattern: '\\p{N}  or  \\p{Number}',
        name: 'Any number (all scripts)',
        description: 'Matches any Unicode digit or numeric character — Arabic-Indic (٠١٢٣), Devanagari (०१२), Roman numerals (Ⅷ), and more. Far broader than \\d which is ASCII [0-9] only.',
        matches: ['/\\p{N}/u.test("٣") → true  (Arabic-Indic 3)', '/\\p{N}/u.test("Ⅷ") → true  (Roman numeral 8)'],
        noMatch: ['/\\d/.test("٣") → false  (\\d is ASCII only)'],
      },
      {
        pattern: '\\p{P}  or  \\p{Punctuation}',
        name: 'Any punctuation (all scripts)',
        description: 'Matches any punctuation character across all scripts: . , ! ? ; : " \' « » and many more from non-Latin writing systems. Use \\P{P} for non-punctuation. Combine with /gu to strip all punctuation from any language.',
        matches: ['str.replace(/\\p{P}+/gu, \'\') strips all unicode punctuation'],
        noMatch: [],
      },
      {
        pattern: '\\p{Script=Latin}',
        name: 'Script property',
        description: 'Matches characters belonging to a specific Unicode script. Common values: Latin, Greek, Cyrillic, Arabic, Han, Hiragana, Katakana, Devanagari, Hebrew, Thai, Georgian. Useful for language-specific validation or detection.',
        matches: ['/^\\p{Script=Latin}+$/u.test("hello") → true', '/^\\p{Script=Greek}+$/u.test("αβγ") → true'],
        noMatch: ['/^\\p{Script=Latin}+$/u.test("γεια") → false (Greek script)'],
      },
      {
        pattern: '\\p{Emoji}',
        name: 'Emoji',
        description: 'Matches emoji characters. With the v flag, \\p{RGI_Emoji} matches complete emoji sequences including skin-tone modifiers and ZWJ sequences (family emoji etc.) as a single logical unit rather than multiple codepoints.',
        matches: ['/\\p{Emoji}/u.test("😀") → true', '/\\p{RGI_Emoji}/v matches "👨‍👩‍👧" as one unit'],
        noMatch: [],
      },
      {
        pattern: '\\p{Sc}  \\p{Lu}  \\p{Ll}  \\p{M}  \\p{ASCII}',
        name: 'Other useful properties',
        description: '\\p{Sc} = currency symbols ($, €, £, ¥, ₹). \\p{Lu} = uppercase letters. \\p{Ll} = lowercase letters. \\p{Lt} = titlecase letters. \\p{M} = combining marks / diacritics (accents that modify the previous character). \\p{ASCII} = any ASCII character U+0000–U+007F.',
        matches: ['/\\p{Sc}/u.test("€") → true', '/\\p{Lu}/u.test("A") → true', '/\\p{M}/u.test("\\u0301") → true  (combining acute accent)'],
        noMatch: [],
      },
    ],
  },

  // ── 8. Common Patterns ────────────────────────────────────────────────────
  {
    id: 'patterns',
    title: 'Common Patterns',
    intro: 'Ready-to-use examples for frequent use cases. These are practical approximations — perfect validation (e.g. full RFC 5322 email) requires far more complex patterns. Always adapt to your specific input constraints.',
    items: [
      {
        pattern: '[\\w.+\\-]+@[\\w\\-]+\\.[a-zA-Z]{2,}',
        name: 'Email address',
        description: 'Covers common email formats. \\w+ for local part, allows dots/plus/hyphen, @ separator, domain with TLD of 2+ letters. Does not handle all RFC 5322 edge cases (quoted strings, IP literals, etc.).',
        matches: ['user@example.com', 'name.last+tag@sub.domain.io'],
        noMatch: ['@example.com (no local part)', 'user@ (no domain)'],
      },
      {
        pattern: 'https?://[\\w./\\-?=%&+#@:]+',
        name: 'URL (simple)',
        description: 'Matches http:// or https:// URLs including path, query, and fragment. The s? makes the s optional. For more complex cases (IPv6, percent-encoding, etc.) use a dedicated URL parser.',
        matches: ['https://example.com/path?q=1&r=2', 'http://foo.bar/a-b#section'],
        noMatch: ['ftp://foo.com (different scheme)'],
      },
      {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
        name: 'ISO date (YYYY-MM-DD)',
        description: 'Matches ISO 8601 date format. Does not validate range — "2024-99-99" matches structurally. Add anchors ^…$ and alternation in each group to validate month/day ranges properly.',
        matches: ['2024-01-15', '1999-12-31'],
        noMatch: ['01/15/2024 (wrong separator)', '24-1-5 (not zero-padded)'],
      },
      {
        pattern: '\\d{2}/\\d{2}/\\d{4}',
        name: 'US date (MM/DD/YYYY)',
        description: 'Matches the common US slash-separated date format with zero-padded month and day.',
        matches: ['01/15/2024', '12/31/1999'],
        noMatch: ['1/5/2024 (not zero-padded)', '2024-01-15 (ISO format)'],
      },
      {
        pattern: '(\\+1[\\s\\-]?)?\\(?\\d{3}\\)?[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}',
        name: 'US phone number',
        description: 'Matches US phone numbers in common formats with optional +1 country code, optional area-code parentheses, and flexible separators (space, dot, or hyphen). Area code is captured in group 2.',
        matches: ['555-867-5309', '(555) 867-5309', '+1 555.867.5309', '5558675309'],
        noMatch: ['+44 20 1234 5678 (UK number)'],
      },
      {
        pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
        name: 'IPv4 address (structural)',
        description: 'Matches four groups of 1–3 digits separated by literal escaped dots. Does not validate that each octet is 0–255. To validate range, use alternation per octet: (25[0-5]|2[0-4]\\d|[01]?\\d\\d?).',
        matches: ['192.168.1.1', '10.0.0.254'],
        noMatch: ['192.168.1 (only 3 octets)'],
      },
      {
        pattern: '#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?',
        name: 'Hex color (3 or 6 digits)',
        description: 'Matches CSS hex colors in both shorthand (#fff) and full (#ffffff) form. The (?:…)? makes the second group of 3 digits optional. Case-insensitive — use /i flag to avoid the A-F range.',
        matches: ['#fff', '#ff0000', '#1A2B3C', '#a1b'],
        noMatch: ['#ff00 (4 digits)', '#gggggg (g is not hex)'],
      },
      {
        pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
        name: 'UUID / GUID',
        description: 'Matches a standard UUID in 8-4-4-4-12 hex digit format (lowercase). Add /i for case-insensitive matching to cover uppercase UUIDs as well. Wrap in ^…$ to validate the entire string.',
        matches: ['550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'],
        noMatch: ['550e8400e29b41d4a716446655440000 (no hyphens)', '{550e8400-…} (curly braces)'],
      },
      {
        pattern: '\\d+\\.\\d+\\.\\d+(?:-[\\w.]+)?(?:\\+[\\w.]+)?',
        name: 'Semantic version (semver)',
        description: 'Matches MAJOR.MINOR.PATCH with optional pre-release (-alpha.1) and build metadata (+build.123) suffixes. Wrap in ^v?…$ for a full semver line match.',
        matches: ['1.0.0', '2.3.14', '1.0.0-alpha.1', '1.0.0+build.123', '1.0.0-rc.1+build.42'],
        noMatch: ['1.0 (missing patch)', 'v1.0.0 (v prefix — add v? to handle)'],
      },
      {
        pattern: '[a-z0-9]+(?:-[a-z0-9]+)*',
        name: 'URL slug',
        description: 'Matches a lowercase URL slug: alphanumeric segments joined by single hyphens. No leading or trailing hyphens. Use /i for case-insensitive slugs. Wrap in ^…$ to validate the entire input.',
        matches: ['hello-world', 'my-blog-post-2024', 'section-1'],
        noMatch: ['-starts-with-hyphen', 'has--double--hyphen', 'Has Upper Case'],
      },
      {
        pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)',
        name: 'Markdown link',
        description: 'Matches a Markdown inline link [text](url). Group 1 = link text, group 2 = URL. [^\\]]+ matches any character except ] (so it stops at the closing bracket). [^)]+ similarly stops at ).',
        matches: ['[Click here](https://example.com)', '[GitHub](https://github.com)'],
        noMatch: ['Bare URLs without markdown syntax'],
      },
      {
        pattern: '@[A-Za-z0-9_]{1,15}',
        name: 'Twitter / X handle',
        description: 'Matches a Twitter/X @handle: @ followed by 1–15 characters that are letters, digits, or underscores. Add \\b before @ or use (?<![\\w@]) as lookbehind to avoid matching inside email addresses.',
        matches: ['@username', '@John_Doe_42'],
        noMatch: ['@thishandleiswaytoolong (over 15 chars)', '@ (empty handle)'],
      },
      {
        pattern: '\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}',
        name: 'Credit card number (structural)',
        description: 'Matches 16 digits in four groups of 4, with optional space or hyphen separators. Does not validate the Luhn checksum or distinguish card types (Visa/Mastercard/Amex etc.). Amex uses 4-6-5 grouping instead.',
        matches: ['4111 1111 1111 1111', '4111-1111-1111-1111', '4111111111111111'],
        noMatch: ['1234 5678 (too few digits)'],
      },
      {
        pattern: '^\\s*$',
        name: 'Blank / empty line',
        description: 'Matches a line containing only whitespace or nothing. ^ and $ anchor to line edges (use m flag for multiline). \\s* means zero or more whitespace characters.',
        matches: ['"" (empty)', '"   " (only spaces)', '"\\t\\t" (only tabs)'],
        noMatch: ['"   x   " (has a visible character)'],
      },
      {
        pattern: '\\b[A-Z][a-z]+\\b',
        name: 'Capitalized word',
        description: 'Matches a word starting with one uppercase letter followed by one or more lowercase. Word boundaries prevent partial matches inside longer words.',
        matches: ['Hello', 'London', 'JavaScript matches "Java" then "Script" separately'],
        noMatch: ['hello (starts lowercase)', 'HTML (all caps)'],
      },
      {
        pattern: '<!--[\\s\\S]*?-->',
        name: 'HTML comment',
        description: 'Matches <!-- to --> including multiline content. [\\s\\S]*? is lazy so it stops at the first --> it encounters. Without lazy, it would swallow everything between the first <!-- and the last --> on the page.',
        matches: ['<!-- comment -->', '<!--\\n  multiline\\n-->'],
        noMatch: [],
      },
      {
        pattern: '/\\*[\\s\\S]*?\\*/',
        name: 'C-style block comment (/* … */)',
        description: 'Same lazy [\\s\\S]*? trick as the HTML comment. Both / and * are escaped so they match literally. Works across multiple lines.',
        matches: ['/* single line */', '/*\\n * multiline\\n */'],
        noMatch: [],
      },
      {
        pattern: '(?:\\/\\/[^\\n]*)(?:\\n|$)',
        name: 'C++ / JS single-line comment (//) ',
        description: 'Matches a line comment from // to end of line. [^\\n]* matches any non-newline characters. The (?:\\n|$) consumes the newline or end-of-string so the next match starts on the next line.',
        matches: ['// this is a comment', '  // indented comment'],
        noMatch: ['/* block comment */'],
      },
    ],
  },

  // ── 9. Practical Recipes ──────────────────────────────────────────────────
  {
    id: 'recipes',
    title: 'Practical Recipes (copy-paste)',
    intro: 'Complete code patterns for the most common regex tasks in JavaScript. Each recipe is a self-contained snippet you can adapt directly.',
    items: [
      {
        pattern: '/^\\d{5}$/.test(str)',
        name: 'Validate — does the whole string match?',
        description: 'Use ^ and $ with test() to ensure the entire string matches, not just a substring. Returns a boolean. Always anchor validation patterns at both ends or the pattern can pass on invalid input with extra characters.',
        matches: ['/^\\d{5}$/.test("90210") → true', '/^\\d{5}$/.test("90210-1234") → false (extra chars)'],
        noMatch: [],
      },
      {
        pattern: 'const m = str.match(re)  // no g flag',
        name: 'Extract first match + capture groups',
        description: 'str.match() without the g flag returns [fullMatch, group1, group2, …] or null. Always check for null before accessing indices. With the g flag it returns only full matches — use matchAll() if you need groups from all occurrences.',
        matches: [
          '"2024-01-15".match(/(\\d{4})-(\\d{2})-(\\d{2})/)',
          '→ ["2024-01-15", "2024", "01", "15"]',
        ],
        noMatch: [],
      },
      {
        pattern: 'const { year } = str.match(re)?.groups ?? {}',
        name: 'Destructure named capture groups',
        description: 'Named groups live on match.groups. Optional chaining (?.) and a fallback ({}) keep the destructure safe when there is no match. Works cleanly in a single line.',
        matches: [
          'const re = /(?<year>\\d{4})-(?<month>\\d{2})/',
          '"2024-01".match(re).groups → { year: "2024", month: "01" }',
        ],
        noMatch: [],
      },
      {
        pattern: '[...str.matchAll(/re/g)].map(m => m[1])',
        name: 'Collect one group from every match',
        description: 'matchAll() requires the g flag and returns an iterator of full match objects. Spread into an array then map to whichever capture group slot you need.',
        matches: [
          'const re = /<(\\w+)>/g',
          '[..."<b><i><u>".matchAll(re)].map(m => m[1]) → ["b", "i", "u"]',
        ],
        noMatch: [],
      },
      {
        pattern: 'str.replace(/re/g, m => m.toUpperCase())',
        name: 'Transform each match with a function',
        description: 'When the replacement is a function it receives (fullMatch, group1, group2, …, offset, originalString). Return the desired replacement string from the function for dynamic transformations.',
        matches: [
          '"hello world".replace(/\\b\\w/g, c => c.toUpperCase()) → "Hello World"',
          '"2024-01-15".replace(/(\\d{4})-(\\d{2})-(\\d{2})/, (_, y, m, d) => `${d}/${m}/${y}`) → "15/01/2024"',
        ],
        noMatch: [],
      },
      {
        pattern: 'str.replace(/[^\\w\\s]/g, \'\')',
        name: 'Delete / remove matches',
        description: 'Replace with an empty string to delete every occurrence. Use a negated character class [^…] to strip everything except what you want to keep.',
        matches: [
          '"hello, world!".replace(/[^\\w\\s]/g, \'\') → "hello world"',
          '"  extra   spaces  ".replace(/\\s+/g, \' \').trim() → "extra spaces"',
        ],
        noMatch: [],
      },
      {
        pattern: '"one,two,,three".split(/,+/)',
        name: 'Split and collapse repeated delimiters',
        description: 'str.split() accepts a regex as the delimiter. A quantifier like /,+/ collapses multiple consecutive delimiters into one split point, preventing empty strings in the result.',
        matches: [
          '"one,two,,three".split(/,+/) → ["one", "two", "three"]',
          '"a  b\\tc".split(/\\s+/) → ["a", "b", "c"]',
        ],
        noMatch: [],
      },
      {
        pattern: '"a:b:c".split(/(,)/)',
        name: 'Split and keep the delimiter',
        description: 'When the regex has a capturing group, str.split() includes the captured delimiter in the result array. Useful for tokenisers that need to preserve separators.',
        matches: [
          '"a,b,c".split(/(,)/) → ["a", ",", "b", ",", "c"]',
          '"one::two".split(/(::)/) → ["one", "::", "two"]',
        ],
        noMatch: [],
      },
      {
        pattern: '(str.match(/re/g) ?? []).length',
        name: 'Count occurrences',
        description: 'str.match() with g returns an array of all full matches, or null when nothing matches. The ?? [] fallback handles null. The array length is the count.',
        matches: [
          '("abcabc".match(/a/g) ?? []).length → 2',
          '[..."hello".matchAll(/l/g)].length → 2  (matchAll alternative)',
        ],
        noMatch: [],
      },
      {
        pattern: 'while ((m = re.exec(str)) !== null)',
        name: 'Iterate with exec() for match positions',
        description: 'exec() gives each match one at a time, including m.index (character offset) and capture groups. Requires the g flag. Guard zero-length matches with re.lastIndex++ to prevent an infinite loop.',
        matches: [
          'const re = /\\d+/g, m',
          'while ((m = re.exec("a1 b22")) !== null)',
          '  console.log(m[0], "@", m.index)  // "1" @ 1, "22" @ 4',
        ],
        noMatch: [],
      },
      {
        pattern: 'str.replaceAll(re, sub)  // g flag required on regex',
        name: 'replaceAll — explicit intent',
        description: 'str.replaceAll() makes the intent clear: replace every occurrence. When passed a regex it requires the g flag (otherwise throws a TypeError). Functionally equivalent to str.replace(/re/g, sub) but self-documenting.',
        matches: [
          '"aabbcc".replaceAll(/b/g, "X") → "aaXXcc"',
          '"foo.bar.baz".replaceAll(/\\./g, "-") → "foo-bar-baz"',
        ],
        noMatch: [],
      },
      {
        pattern: 'userStr.replace(/[.*+?^${}()|[\\]\\\\]/g, \'\\\\$&\')',
        name: 'Escape a string for safe use in new RegExp()',
        description: 'When building a regex from user input, escape all metacharacters first so they are treated as literals. $& in the replacement refers to the entire matched metacharacter. This is the MDN-recommended escapeRegExp helper.',
        matches: [
          'escapeRegExp("hello.world") → "hello\\\\.world"',
          'escapeRegExp("(a+b)") → "\\\\(a\\\\+b\\\\)"',
          'new RegExp(escapeRegExp(userStr)) → safe literal match',
        ],
        noMatch: [],
      },
      {
        pattern: '/^\\w+(?:\\s+\\w+)*$/m  with g flag on multiline text',
        name: 'Process each line independently',
        description: 'Use the m flag so ^ and $ match per-line. Combine with g to find matches on every line in a single pass. This avoids splitting the string on \\n manually.',
        matches: [
          'const lines = [...text.matchAll(/^.*$/gm)].map(m => m[0])',
          '// Each m[0] is one complete line of text',
          '/^\\s*#.*/gm matches every comment line in a config file',
        ],
        noMatch: [],
      },
    ],
  },

  // ── 10. Performance & Pitfalls ────────────────────────────────────────────
  {
    id: 'pitfalls',
    title: 'Performance & Pitfalls',
    intro: 'Common regex mistakes range from patterns that silently match too much to patterns that cause catastrophic backtracking. These are the traps most developers hit and how to avoid them.',
    items: [
      {
        pattern: '(a+)+  or  (\\w+\\s*)*',
        name: 'Catastrophic backtracking (ReDoS)',
        description: 'Nested quantifiers on overlapping patterns cause exponential backtracking. Each extra character in the input can double the work. On long strings the browser or server appears to hang. Fix: eliminate nesting by rewriting the pattern so quantifiers do not overlap — use \\w+ instead of (\\w+\\s*)+, or \\w+(?:\\s+\\w+)* instead of (\\w+\\s*)+.',
        matches: [
          'BAD:  /(a+)+z/ on "aaaaaaaaab" — exponential time',
          'GOOD: /a+z/ — linear time',
          'BAD:  /(\\w+\\s*)*/ on long non-matching input — hangs',
          'GOOD: /\\w+(?:\\s+\\w+)*/ — no nested repetition on same chars',
        ],
        noMatch: [],
      },
      {
        pattern: 'const re = /x/g;  re.test(str)',
        name: 'Stateful test() / exec() with the g or y flag',
        description: 'Regex objects with g or y store lastIndex state. Each test() or exec() call advances lastIndex. Reusing the same regex object for multiple independent checks will alternate true/false. Fix: reset re.lastIndex = 0 before each use, create a fresh regex each call, or use str.includes() for simple presence checks.',
        matches: [
          'const re = /x/g',
          're.test("x") → true   (lastIndex → 1)',
          're.test("x") → false  (lastIndex past end, resets to 0)',
          're.test("x") → true   (cycles again)',
        ],
        noMatch: [],
      },
      {
        pattern: '/http://example.com/',
        name: 'Unescaped dot matches any character',
        description: 'The dot (.) matches any character except newline. A URL pattern written with literal dots also matches "httpX//exampleYcom". Always escape literal dots as \\. in patterns. Use a linter or test the pattern against strings that should NOT match.',
        matches: [
          'BAD:  /http://example.com/ also matches "httpX//exampleYcom"',
          'GOOD: /https?:\\/\\/example\\.com/ — dots and slashes escaped',
        ],
        noMatch: [],
      },
      {
        pattern: '/cat/  vs  /\\bcat\\b/',
        name: 'Forgetting word boundaries',
        description: 'Without boundaries, /cat/ matches inside "concatenate", "scatter", and "wildcat". Add \\b on each side for whole-word matching. The boundary is zero-width — it does not consume a character.',
        matches: [
          'BAD:  /cat/g matches "cat" in "concatenate"',
          'GOOD: /\\bcat\\b/g matches "cat" only as a complete word',
        ],
        noMatch: [],
      },
      {
        pattern: 'new RegExp("\\\\d+")',
        name: 'Double-escaping in new RegExp()',
        description: 'When building a regex from a string, the string parser consumes one backslash before the regex engine sees the pattern. The string "\\d" (one backslash) becomes the single character d. You need "\\\\d" (two backslashes in the string) to produce the regex token \\d. Use String.raw`\\d+` to write the pattern without extra escaping.',
        matches: [
          'new RegExp("\\\\d+")     → equivalent to /\\d+/',
          'new RegExp("\\\\b\\\\w+\\\\b") → equivalent to /\\b\\w+\\b/',
          'String.raw`\\d+`        → no double-escaping needed',
        ],
        noMatch: [],
      },
      {
        pattern: '/<.+>/  on  "<a>foo</a><b>bar</b>"',
        name: 'Greedy quantifiers consuming too much',
        description: 'Greedy .+ or .* match as many characters as possible. On "<a>foo</a><b>bar</b>", /<.+>/ greedily matches the entire string from the first < to the last >. Fix with a lazy quantifier <.+?> or, better, a negated character class <[^>]+> which cannot cross the delimiter at all and requires no backtracking.',
        matches: [
          'BAD:    /<.+>/  → "<a>foo</a><b>bar</b>" (one giant match)',
          'BETTER: /<.+?>/ → "<a>", "</a>", "<b>", "</b>" (lazy)',
          'BEST:   /<[^>]+>/ → same result, no backtracking',
        ],
        noMatch: [],
      },
      {
        pattern: 'const re = /^/m.test(str)',
        name: 'Anchors with the m flag behave differently',
        description: 'Without m, ^ and $ match only the very start and end of the entire string. With m, they match at the start and end of every line. Using ^ with g and m will find the position before each line, not just the first. This surprises developers who expect ^ to match only once.',
        matches: [
          '/^\\d/g on "1a\\n2b\\n3c" → ["1"] (no m)',
          '/^\\d/gm on "1a\\n2b\\n3c" → ["1","2","3"] (m flag)',
        ],
        noMatch: [],
      },
    ],
  },

  // ── 11. Reading a Regex ───────────────────────────────────────────────────
  {
    id: 'howto',
    title: 'Reading a Regex — Step by Step',
    intro: 'When you see an unfamiliar regex, read it left to right, one token at a time. Each token is a literal character, a character class, a quantifier, an anchor, or a group. Break it into parts then translate each part to plain English.',
    items: [
      {
        pattern: '^[\\w.+\\-]+@[\\w\\-]+(\\.[a-zA-Z]{2,})+$',
        name: 'Breakdown: email address',
        description: '① ^ — match must start here. ② [\\w.+\\-]+ — one or more word chars, dots, pluses, or hyphens (local part). ③ @ — literal at-sign. ④ [\\w\\-]+ — one or more word chars or hyphens (domain name). ⑤ (\\.[a-zA-Z]{2,})+ — one or more ".extension" segments (handles sub-domains and multi-part TLDs like .co.uk). ⑥ $ — match must end here.',
        matches: ['user@example.com', 'a.b+c@sub.domain.co.uk'],
        noMatch: [],
      },
      {
        pattern: '(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])',
        name: 'Breakdown: strict ISO date with range validation',
        description: '① (?<year>\\d{4}) — named group "year", exactly 4 digits. ② - — literal hyphen. ③ (?<month>0[1-9]|1[0-2]) — "month": either 01–09 OR 10–12 using alternation. ④ - — literal hyphen. ⑤ (?<day>0[1-9]|[12]\\d|3[01]) — "day": 01–09, OR 10–29, OR 30–31. Each part of the alternation handles a specific valid range.',
        matches: ['2024-01-15', '1999-12-31'],
        noMatch: ['2024-00-15 (month 00)', '2024-01-32 (day 32)'],
      },
      {
        pattern: '(?<=\\$)[\\d,]+\\.\\d{2}',
        name: 'Breakdown: US dollar amount with lookbehind',
        description: '① (?<=\\$) — positive lookbehind: must be preceded by a literal $ (no $ consumed). ② [\\d,]+ — one or more digits or commas (the integer part with thousands separators). ③ \\. — literal dot. ④ \\d{2} — exactly 2 digits (cents). Result: matches "1,234.56" in "$1,234.56" without capturing the $.',
        matches: ['"$1,234.56" → matches "1,234.56"', '"$0.99" → matches "0.99"'],
        noMatch: ['"€1,234.56" — lookbehind requires $'],
      },
    ],
  },

  // ── 12. JavaScript Regex API ──────────────────────────────────────────────
  {
    id: 'javascript',
    title: 'JavaScript Regex API',
    intro: 'All the methods and properties you need to use regex in JavaScript code. Most string methods accept a regex — the RegExp methods (test, exec) exist for cases where you need finer control.',
    items: [
      {
        pattern: 'str.match(re)',
        name: 'Find matches',
        description: 'Without g: returns [fullMatch, group1, group2, …, index, input, groups] or null. With g: returns an array of all full matches (no capture groups — use matchAll() for those). Returns null on no match in both modes.',
        matches: ['"2024-01".match(/(\\d{4})-(\\d{2})/) → ["2024-01", "2024", "01"]'],
        noMatch: [],
      },
      {
        pattern: 'str.matchAll(re)',
        name: 'Find all matches with groups',
        description: 'Returns an iterator of every match, each containing the full match, all capture groups, index, input, and groups (named). Requires the g flag. Spread with [...str.matchAll(re)] to get an array. The go-to when you need groups from multiple matches.',
        matches: ['[..."a1b2".matchAll(/([a-z])(\\d)/g)] → [["a1","a","1"], ["b2","b","2"]]'],
        noMatch: [],
      },
      {
        pattern: 're.test(str)',
        name: 'Test for a match (boolean)',
        description: 'Returns true if there is a match anywhere in the string, false otherwise. The fastest way to check for a pattern\'s presence. Caution: avoid reusing a g-flag regex with test() — lastIndex advances and alternates results.',
        matches: ['/^\\d{4}$/.test("2024") → true', '/^\\d{4}$/.test("24") → false'],
        noMatch: [],
      },
      {
        pattern: 're.exec(str)',
        name: 'Execute — one match at a time',
        description: 'Returns a match array (same shape as str.match() without g) or null. With the g or y flag, successive calls advance through the string. Essential for exec() loops that need both position and capture groups for every match.',
        matches: [
          'const re = /\\d+/g',
          're.exec("a1b2") → ["1", index:1]',
          're.exec("a1b2") → ["2", index:3]',
          're.exec("a1b2") → null',
        ],
        noMatch: [],
      },
      {
        pattern: 'str.replace(re, sub)',
        name: 'Replace / transform',
        description: 'Replace matches with a string or function. String replacement supports $1 (group 1), $<name> (named group), $& (full match), $` (text before), $\' (text after), $$ (literal $). Function replacement receives (match, …groups, offset, original) and returns the replacement.',
        matches: ['"2024-01-15".replace(/(\\d{4})-(\\d{2})-(\\d{2})/, "$3/$2/$1") → "15/01/2024"'],
        noMatch: [],
      },
      {
        pattern: 'str.replaceAll(re, sub)',
        name: 'Replace all occurrences',
        description: 'Identical to str.replace(/re/g, sub) but with explicit intent. When passed a regex, the g flag is required (throws TypeError otherwise). The replacement argument supports the same $1, $&, etc. specials as str.replace().',
        matches: ['"a.b.c".replaceAll(/\\./g, "-") → "a-b-c"'],
        noMatch: [],
      },
      {
        pattern: 'str.search(re)',
        name: 'Find index of first match',
        description: 'Returns the character index of the first match, or -1 if none. Always searches from the beginning regardless of re.lastIndex or the g flag. Faster than match() when you only need the position, not the matched text.',
        matches: ['"hello world".search(/world/) → 6', '"hello".search(/\\d/) → -1'],
        noMatch: [],
      },
      {
        pattern: 'str.split(re)',
        name: 'Split on a pattern',
        description: 'Uses the regex as the delimiter. If the regex contains a capturing group, the captured delimiters are included in the result array between the parts. An optional second argument limits the number of parts returned.',
        matches: [
          '"one1two2three".split(/\\d/) → ["one", "two", "three"]',
          '"a,b,c".split(/(,)/) → ["a", ",", "b", ",", "c"]  (delimiter kept)',
        ],
        noMatch: [],
      },
      {
        pattern: 're.source  re.flags  re.lastIndex',
        name: 'RegExp instance properties',
        description: 're.source — the pattern string (no slashes or flags). re.flags — the active flags as a sorted string. re.lastIndex — the index at which the next g/y match starts (readable and writable). Shorthand booleans: re.global, re.ignoreCase, re.multiline, re.sticky, re.unicode, re.dotAll, re.hasIndices.',
        matches: [
          '/\\d+/gi.source → "\\\\d+"',
          '/\\d+/gi.flags  → "gi"',
          '/\\d+/g.lastIndex → 0  (before first exec)',
        ],
        noMatch: [],
      },
      {
        pattern: 'new RegExp(pattern, flags)',
        name: 'Dynamic regex construction',
        description: 'Build a regex from a runtime string — useful when the pattern comes from user input, config, or is assembled from parts. Backslashes must be doubled in string form: "\\\\d" → regex \\d. Use String.raw`\\d+` to avoid doubling. Always escape user-provided substrings with a metacharacter-escaping helper before inserting them.',
        matches: [
          'const term = "hello"',
          'const re = new RegExp(`\\\\b${term}\\\\b`, "gi")  // /\\bhello\\b/gi',
          '// Escape untrusted input first:',
          'const safe = s.replace(/[.*+?^${}()|[\\]\\\\]/g, \'\\\\$&\')',
        ],
        noMatch: [],
      },
      {
        pattern: 're.toString()',
        name: 'Convert regex to string',
        description: 'Returns the regex as a string literal including slashes and flags — e.g. "/\\\\d+/gi". Useful for logging, storing in JSON, or transmitting. To reconstruct, parse the slashes and flags out and pass to new RegExp().',
        matches: ['/\\d+/gi.toString() → "/\\\\d+/gi"'],
        noMatch: [],
      },
    ],
  },
]

function RefItem({ item }) {
  return (
    <div className="ref-item">
      <div className="ref-item-header">
        <code className="ref-pattern">{item.pattern}</code>
        <span className="ref-name">{item.name}</span>
      </div>
      <p className="ref-desc">{item.description}</p>
      {(item.matches.length > 0 || item.noMatch.length > 0) && (
        <div className="ref-examples">
          {item.matches.length > 0 && (
            <div className="ref-example-group">
              <span className="ref-example-label match-label">examples</span>
              <ul>
                {item.matches.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          {item.noMatch.length > 0 && (
            <div className="ref-example-group">
              <span className="ref-example-label nomatch-label">won't match</span>
              <ul>
                {item.noMatch.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RefSection({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ref-section${open ? ' ref-section--open' : ''}`}>
      <button className="ref-section-toggle" onClick={() => setOpen(o => !o)}>
        <span>{section.title}</span>
        <span className="ref-section-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ref-section-body">
          <p className="ref-intro">{section.intro}</p>
          <div className="ref-items">
            {section.items.map((item, i) => <RefItem key={i} item={item} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReferencePanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="ref-panel">
      <button className="ref-panel-toggle" onClick={() => setOpen(o => !o)}>
        <span className="ref-panel-toggle-label">
          {open ? '▲' : '▼'} Regex Reference &amp; Study Guide
        </span>
        <span className="ref-panel-toggle-hint">
          {open ? 'Hide' : 'Anchors · Char classes · Escapes · Quantifiers · Groups · Flags · Unicode · Patterns · Recipes · Pitfalls · JS API'}
        </span>
      </button>
      {open && (
        <div className="ref-panel-body">
          {SECTIONS.map(s => <RefSection key={s.id} section={s} />)}
        </div>
      )}
    </div>
  )
}
