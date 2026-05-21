import { useState } from 'react'
import './ReferencePanel.css'

const SECTIONS = [
  {
    id: 'anchors',
    title: 'Anchors',
    intro: 'Anchors match a position in the string, not a character. They are zero-width — they assert something about where you are without consuming any characters.',
    items: [
      {
        pattern: '^',
        name: 'Start of string',
        description: 'The match must begin at the very start of the string. With the multiline flag (m), it matches the start of each line.',
        matches: ['hello world (when pattern is ^hello)'],
        noMatch: ['say hello (^ fails — "hello" isn\'t at position 0)'],
      },
      {
        pattern: '$',
        name: 'End of string',
        description: 'The match must end at the very end of the string. With the multiline flag (m), it matches the end of each line.',
        matches: ['"world" in "hello world" (pattern: world$)'],
        noMatch: ['"world" in "world domination" (something follows)'],
      },
      {
        pattern: '\\b',
        name: 'Word boundary',
        description: 'Matches the position between a word character (\\w = letter, digit, underscore) and a non-word character. Essential for matching whole words so "cat" doesn\'t match inside "concatenate".',
        matches: ['"cat" in "the cat sat"', '"cat" in "cat."'],
        noMatch: ['"cat" inside "concatenate"', '"cat" inside "scat"'],
      },
      {
        pattern: '\\B',
        name: 'Non-word boundary',
        description: 'Matches a position that is NOT a word boundary — i.e., inside a word. Useful for finding substrings that must not appear at a word edge.',
        matches: ['"cat" inside "concatenate" (\\Bcat\\B)'],
        noMatch: ['"cat" in "the cat" (it\'s at a boundary)'],
      },
    ],
  },
  {
    id: 'charclasses',
    title: 'Character Classes',
    intro: 'Character classes match a single character from a defined set. Shorthand classes like \\d are just convenient aliases for bracket expressions.',
    items: [
      {
        pattern: '.',
        name: 'Any character (dot)',
        description: 'Matches any single character except a newline (\\n). With the dotall flag (s), it also matches newlines. Combine as [\\s\\S] to always match everything.',
        matches: ['h_t matches "hat", "hit", "h3t", "h.t"'],
        noMatch: ['h\\nt (newline between h and t, without flag s)'],
      },
      {
        pattern: '\\d',
        name: 'Digit',
        description: 'Matches any digit character: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. Exactly equivalent to [0-9]. Use \\D to match the opposite — any non-digit.',
        matches: ['0', '7', '9 — any single digit character'],
        noMatch: ["a, ' ', '.' — non-digit characters"],
      },
      {
        pattern: '\\w',
        name: 'Word character',
        description: 'Matches any letter (a–z, A–Z), digit (0–9), or underscore (_). Equivalent to [a-zA-Z0-9_]. Use \\W for the opposite.',
        matches: ['a', 'Z', '5', '_'],
        noMatch: ["' ', '@', '-', '!' — punctuation and spaces"],
      },
      {
        pattern: '\\s',
        name: 'Whitespace',
        description: 'Matches any whitespace character: space ( ), tab (\\t), newline (\\n), carriage return (\\r), form feed (\\f), vertical tab (\\v). Use \\S for the opposite.',
        matches: ['" " (space)', '"\\t" (tab)', '"\\n" (newline)'],
        noMatch: ['Any visible character'],
      },
      {
        pattern: '[abc]',
        name: 'Character set (bracket expression)',
        description: 'Matches any ONE character from the set. You can list characters individually or use ranges. [a-z] = any lowercase letter. [0-9] = any digit. [a-zA-Z0-9] = any alphanumeric. Order inside brackets doesn\'t matter.',
        matches: ['[aeiou] matches "a", "e", "i", "o", "u"'],
        noMatch: ['[aeiou] does not match "b", "c", "d"'],
      },
      {
        pattern: '[^abc]',
        name: 'Negated character set',
        description: 'The caret ^ inside brackets means "NOT". Matches any single character that is NOT in the set. [^0-9] matches any non-digit. [^\\n] matches any non-newline character.',
        matches: ['[^aeiou] matches "b", "c", "1", " "'],
        noMatch: ['[^aeiou] does not match "a", "e", "i", "o", "u"'],
      },
    ],
  },
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
        noMatch: ['\\d{4} → "123" (only 3), "12345" (5, but greedy won\'t over-match with anchors)'],
      },
      {
        pattern: '{n,}',
        name: 'At least n',
        description: 'The preceding element must appear n or more times. \\d{3,} matches three digits or more.',
        matches: ['\\d{3,} → "123", "1234", "99999"'],
        noMatch: ['\\d{3,} → "12" (only 2 digits)'],
      },
      {
        pattern: '{n,m}',
        name: 'Between n and m',
        description: 'The preceding element must appear between n and m times (both inclusive). \\d{2,4} matches 2, 3, or 4 digits.',
        matches: ['\\d{2,4} → "12", "123", "1234"'],
        noMatch: ['\\d{2,4} → "1" (too few), though "12345" will match "1234" greedily'],
      },
      {
        pattern: '*',
        name: 'Zero or more',
        description: 'The preceding element may appear zero or more times. Equivalent to {0,}. Matches even if the element doesn\'t appear at all.',
        matches: ['go*d → "gd", "god", "good", "goood"'],
        noMatch: ['go*d → "gad" (wrong vowel)'],
      },
      {
        pattern: '+',
        name: 'One or more',
        description: 'The preceding element must appear at least once. Equivalent to {1,}. Unlike *, requires at least one match.',
        matches: ['go+d → "god", "good", "goood"'],
        noMatch: ['go+d → "gd" (no "o" present)'],
      },
      {
        pattern: '?',
        name: 'Zero or one (optional)',
        description: 'The preceding element is optional — it appears 0 or 1 time. Equivalent to {0,1}. Useful for optional suffixes, prefixes, or alternate spellings.',
        matches: ['colou?r → "color", "colour"'],
        noMatch: ['colou?r → "colouur" (two u\'s)'],
      },
      {
        pattern: '*?  +?  {n,m}?',
        name: 'Lazy (non-greedy) quantifiers',
        description: 'Adding ? after any quantifier makes it lazy: it matches as FEW characters as possible. This is essential when matching between delimiters. Greedy <.+> on "<b>hi</b>" matches the whole thing. Lazy <.+?> matches "<b>" then "</b>" separately.',
        matches: ['<.+?> on "<b>hi</b>" → ["<b>", "</b>"]'],
        noMatch: ['<.+> (greedy) on "<b>hi</b>" → ["<b>hi</b>"] — swallows everything'],
      },
    ],
  },
  {
    id: 'groups',
    title: 'Groups & Capturing',
    intro: 'Groups let you treat a sequence of characters as a single unit, apply quantifiers to multi-character patterns, and extract sub-matches from results.',
    items: [
      {
        pattern: '(abc)',
        name: 'Capturing group',
        description: 'Groups the pattern AND captures the match as a numbered group. Groups are numbered by their opening parenthesis position, left to right, starting at 1. Access with match[1], match[2], etc. in JavaScript.',
        matches: ['(\\d{4})-(\\d{2}) on "2024-01" → match[1]="2024", match[2]="01"'],
        noMatch: [],
      },
      {
        pattern: '(?:abc)',
        name: 'Non-capturing group',
        description: 'Groups WITHOUT capturing. Use (?:) when you need grouping for quantifiers or alternation but don\'t want to capture the value. Slightly faster and keeps match index numbers clean.',
        matches: ['(?:ab)+ matches "ab", "abab", "ababab" — group not captured'],
        noMatch: [],
      },
      {
        pattern: '(?<name>abc)',
        name: 'Named capture group',
        description: 'Captures AND assigns a name. Clearer than numbered groups when a regex has many captures. In JavaScript: match.groups.name. The name must be a valid identifier (letters, digits, underscores; starts with a letter).',
        matches: ['(?<year>\\d{4})-(?<month>\\d{2}) → groups.year="2024", groups.month="01"'],
        noMatch: [],
      },
      {
        pattern: 'a|b',
        name: 'Alternation (OR)',
        description: 'Matches either the left OR the right side. The engine tries the left option first. Use groups to control scope: without grouping, cat|dogs matches "cat" or "dogs". With grouping, (cat|dog)s matches "cats" or "dogs".',
        matches: ['cat|dog matches "cat" and "dog"'],
        noMatch: ['cat|dog does not match "fish"'],
      },
      {
        pattern: '(?=abc)',
        name: 'Positive lookahead',
        description: 'Asserts that the specified pattern follows the current position, without including it in the match. Zero-width. Useful for "match X only when followed by Y".',
        matches: ['\\d+(?= dollars) on "100 dollars" → matches "100" (not "dollars")'],
        noMatch: ['\\d+(?= dollars) on "100 euros" → no match'],
      },
      {
        pattern: '(?!abc)',
        name: 'Negative lookahead',
        description: 'Asserts that the specified pattern does NOT follow the current position. Zero-width. Useful for "match X only when NOT followed by Y".',
        matches: ['\\d+(?! dollars) on "100 euros" → matches "100"'],
        noMatch: ['\\d+(?! dollars) on "100 dollars" → no match'],
      },
      {
        pattern: '(?<=abc)',
        name: 'Positive lookbehind',
        description: 'Asserts that the specified pattern precedes the current position, without including it in the match. Zero-width.',
        matches: ['(?<=\\$)\\d+ on "$100" → matches "100"'],
        noMatch: ['(?<=\\$)\\d+ on "€100" → no match'],
      },
      {
        pattern: '(?<!abc)',
        name: 'Negative lookbehind',
        description: 'Asserts that the specified pattern does NOT precede the current position.',
        matches: ['(?<!\\$)\\d+ on "€100" → matches "100"'],
        noMatch: ['(?<!\\$)\\d+ on "$100" → no match'],
      },
    ],
  },
  {
    id: 'flags',
    title: 'Flags',
    intro: 'Flags appear after the closing slash — /pattern/flags — and change how the entire regex behaves. Multiple flags can be combined: /pattern/gim.',
    items: [
      {
        pattern: 'g',
        name: 'Global',
        description: 'Find ALL matches in the string instead of stopping after the first. The builder uses /g automatically. Without g, String.match() returns only the first match and its capture groups.',
        matches: ['/\\d+/g on "1 plus 2 equals 3" → ["1", "2", "3"]'],
        noMatch: ['/\\d+/ (no g) on same string → ["1"] only'],
      },
      {
        pattern: 'i',
        name: 'Case-insensitive',
        description: 'Makes letter matching case-insensitive. [a-z] also matches [A-Z] and vice versa. Does not affect \\d, \\w, or character sets with explicit ranges.',
        matches: ['/hello/i matches "hello", "Hello", "HELLO", "hElLo"'],
        noMatch: [],
      },
      {
        pattern: 'm',
        name: 'Multiline',
        description: 'Changes ^ and $ to match the start and end of each LINE rather than the whole string. Essential when processing multi-line input. Does not affect \\A or \\Z (which don\'t exist in JS anyway).',
        matches: ['/^\\w+/gm on "hello\\nworld" → ["hello", "world"]'],
        noMatch: ['/^\\w+/g (no m) on same string → ["hello"] only'],
      },
      {
        pattern: 's',
        name: 'Dotall',
        description: 'Makes the dot (.) also match newline characters (\\n). Without this flag, . matches everything except \\n. Available in JavaScript since ES2018.',
        matches: ['/a.b/s matches "a\\nb" (newline between a and b)'],
        noMatch: ['/a.b/ (no s) does not match "a\\nb"'],
      },
      {
        pattern: 'd',
        name: 'Indices',
        description: 'Adds a .indices property to match results with the [start, end] positions of each capture group. Available in JavaScript since ES2022.',
        matches: ['/(?<y>\\d{4})/d → match.indices.groups.y = [0, 4]'],
        noMatch: [],
      },
    ],
  },
  {
    id: 'patterns',
    title: 'Common Patterns',
    intro: 'Practical ready-to-use examples. Copy and adapt for your own use. Note: many of these are useful approximations rather than perfect validators — exact validation (e.g. full RFC 5322 email) requires far more complex patterns.',
    items: [
      {
        pattern: '[\\w.+\\-]+@[\\w\\-]+\\.[a-zA-Z]{2,}',
        name: 'Email address',
        description: 'Covers common email formats. \\w+ for local part, allows dots/plus/hyphen, @ separator, domain with extension of 2+ letters. Does not handle all RFC edge cases.',
        matches: ['user@example.com', 'name.last+tag@sub.domain.io'],
        noMatch: ['@example.com (no local part)', 'user@ (no domain)'],
      },
      {
        pattern: 'https?://[\\w./\\-?=%&+#]+',
        name: 'URL (simple)',
        description: 'Matches http:// or https:// URLs including path, query string, and fragments. The ? after s makes the s optional (http or https).',
        matches: ['https://example.com/path?q=1', 'http://foo.bar/a-b'],
        noMatch: ['ftp://foo.com (different scheme)'],
      },
      {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
        name: 'ISO date (YYYY-MM-DD)',
        description: 'Matches ISO 8601 date format. Does not validate that month/day values are in range — "2024-99-99" would match structurally.',
        matches: ['2024-01-15', '1999-12-31'],
        noMatch: ['01/15/2024', '24-1-5 (no zero-padding)'],
      },
      {
        pattern: '\\d{2}/\\d{2}/\\d{4}',
        name: 'US date (MM/DD/YYYY)',
        description: 'Matches the common US slash-separated date format.',
        matches: ['01/15/2024', '12/31/1999'],
        noMatch: ['1/5/2024 (not zero-padded)', '2024-01-15'],
      },
      {
        pattern: '(\\d{3})[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}',
        name: 'US phone number',
        description: 'Matches US numbers with optional separators (space, dot, or hyphen) between groups. Area code captured in group 1.',
        matches: ['555-867-5309', '555.867.5309', '5558675309'],
        noMatch: ['+1-555-867-5309 (country code not included)'],
      },
      {
        pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
        name: 'IPv4 address',
        description: 'Matches four groups of 1–3 digits separated by literal dots. The dot is escaped (\\.) so it matches only a literal dot. Does not validate that each octet is 0–255.',
        matches: ['192.168.1.1', '10.0.0.254'],
        noMatch: ['192.168.1 (only 3 octets)', '999.0.0.1 (structurally matches but invalid)'],
      },
      {
        pattern: '#[0-9a-fA-F]{6}',
        name: 'Hex color (6-digit)',
        description: 'Matches a CSS hex color with leading #. [0-9a-fA-F] is the character class for a hex digit. Add {3} variant to also match shorthand colors: #[0-9a-fA-F]{3,6}.',
        matches: ['#ff0000 (red)', '#1A2B3C', '#ffffff'],
        noMatch: ['#gg0000 (g is not hex)', '#ff00 (only 4 digits)'],
      },
      {
        pattern: '^\\s*$',
        name: 'Blank / empty line',
        description: 'Matches a line containing only whitespace (or nothing at all). ^ and $ anchor to the line. \\s* means "any number of whitespace characters including zero".',
        matches: ['"" (empty string)', '"   " (spaces only)', '"\\t" (tab only)'],
        noMatch: ['"   x   " (has a visible character)'],
      },
      {
        pattern: '\\b[A-Z][a-z]+\\b',
        name: 'Capitalized word',
        description: 'Matches a word that starts with an uppercase letter followed by one or more lowercase letters. Word boundaries prevent matching inside longer words.',
        matches: ['Hello', 'London', 'JavaScript (matches "Java" then "Script" separately)'],
        noMatch: ['hello (lowercase start)', 'HTML (all caps)'],
      },
      {
        pattern: '<!--[\\s\\S]*?-->',
        name: 'HTML comment',
        description: 'Matches an HTML comment from <!-- to -->. [\\s\\S]*? uses a lazy quantifier so it stops at the first --> rather than the last. Without lazy, it would consume everything between the first <!-- and last --> on a page.',
        matches: ['<!-- this is a comment -->'],
        noMatch: [],
      },
      {
        pattern: '/\\*[\\s\\S]*?\\*/',
        name: 'C-style block comment',
        description: 'Matches /* ... */ block comments. Same lazy trick as the HTML comment. Both / and * are escaped with \\ to match literal characters.',
        matches: ['/* this is a comment */'],
        noMatch: [],
      },
    ],
  },
  {
    id: 'howto',
    title: 'Reading a Regex — Step by Step',
    intro: 'When you see an unfamiliar regex, break it into tokens left to right. Each token is a character class, quantifier, anchor, or group.',
    items: [
      {
        pattern: '^[\\w.+\\-]+@[\\w\\-]+(\\.[a-zA-Z]{2,})+$',
        name: 'Breakdown example: email',
        description: '① ^ — must start here. ② [\\w.+\\-]+ — one or more word chars, dots, pluses, hyphens (local part). ③ @ — literal at-sign. ④ [\\w\\-]+ — one or more word chars or hyphens (domain name). ⑤ (\\.[a-zA-Z]{2,})+ — one or more ".extension" segments (handles sub-domains and multi-part TLDs). ⑥ $ — must end here.',
        matches: ['user@example.com', 'a.b+c@sub.domain.co.uk'],
        noMatch: [],
      },
      {
        pattern: '(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])',
        name: 'Breakdown example: strict ISO date',
        description: '① (?<year>\\d{4}) — named group "year", exactly 4 digits. ② - — literal hyphen. ③ (?<month>0[1-9]|1[0-2]) — named group "month", either 01–09 or 10–12 (uses alternation). ④ - — literal hyphen. ⑤ (?<day>0[1-9]|[12]\\d|3[01]) — named group "day", 01–09, 10–29, or 30–31.',
        matches: ['2024-01-15', '1999-12-31'],
        noMatch: ['2024-00-15 (month 00)', '2024-01-32 (day 32)'],
      },
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript Regex API',
    intro: 'How to use regex patterns in JavaScript code.',
    items: [
      {
        pattern: 'str.match(re)',
        name: 'Find matches',
        description: 'Without flag g: returns [fullMatch, group1, group2, …] or null. With flag g: returns an array of all full matches (no capture groups). For all matches AND groups, use matchAll().',
        matches: ['"2024-01".match(/(\\d{4})-(\\d{2})/) → ["2024-01", "2024", "01"]'],
        noMatch: [],
      },
      {
        pattern: 're.test(str)',
        name: 'Test for a match',
        description: 'Returns true or false. The fastest way to check if a pattern exists. Avoid using with flag g on shared regexes — the regex object stores lastIndex state.',
        matches: ['/^\\d{4}$/.test("2024") → true'],
        noMatch: [],
      },
      {
        pattern: 'str.replace(re, sub)',
        name: 'Replace',
        description: 'Replaces matches with a string or function result. In the replacement string, $1 refers to group 1, $<name> to a named group, $& to the whole match.',
        matches: ['"2024-01-15".replace(/(\\d{4})-(\\d{2})-(\\d{2})/, "$3/$2/$1") → "15/01/2024"'],
        noMatch: [],
      },
      {
        pattern: 'str.matchAll(re)',
        name: 'Find all matches with groups',
        description: 'Returns an iterator of all matches, each including capture groups. Requires the g flag. Use [...str.matchAll(re)] to get an array.',
        matches: ['[..."a1b2".matchAll(/([a-z])(\\d)/g)] → [["a1","a","1"], ["b2","b","2"]]'],
        noMatch: [],
      },
      {
        pattern: 'str.split(re)',
        name: 'Split on pattern',
        description: 'Splits a string using a regex as the delimiter. If the regex has a capturing group, the captured text is included in the result array.',
        matches: ['"one1two2three".split(/\\d/) → ["one", "two", "three"]'],
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
              <span className="ref-example-label match-label">matches</span>
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
          {open ? 'Hide' : 'Anchors · Character classes · Quantifiers · Groups · Flags · Common patterns · JS API'}
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
