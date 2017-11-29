// LF is a real linefeed as opposed to an escape sequence representing one.
const LF = '\n';

const wordSeparator = ' ';

function endsWithWhitespace(s) {
  return /\s+$/.test(s)

}
function endsWithEscapedWhitespace(s) {
  return /\\(t|n)$/.test(s);
}

function processString(s, isRaw) {
  // Each individual string consists of zero or more double-linefeed separated
  // "paragraphs".
  const paragraphs = s.split(/\n{2,}/).filter( p => p != "")

  // Processing causes each "paragraph" to be collapsed into a single line.
  const lines = paragraphs.map((para) => {
    // // An empty or effectively empty paragraph is meaningless.
    // let p = para

    // TODO(DH): Before trimming, note whether it ended with /\n[ \t]*/ ?
    let p = para.trim()
    if (p === "") {
      return null
    }
    // let p = para.replace(/^\s+/, "")
    // let p = para.replace(/\n\s*$/, "")

    // In the current paragraph, iteratively remove each real LF along with any
    // indentation that follows it.
    let idxLF = p.indexOf(LF);
    while (idxLF !== -1) {
      const linePreLF = p.slice(0, idxLF);

      p = p.replace(
        /\n[ \t]*/,
        // If the programmer specified some escaped whitespace immediately
        // before the real LF, a word separator does not need to be inserted,
        // because that is them signalling that they want explicit control.
        endsWithEscapedWhitespace(linePreLF) ? '' : wordSeparator);

      idxLF = p.indexOf(LF, idxLF);
    }

    if (isRaw) {
      // Replace these escape sequences with the real characters.
      p = p.replace(/\\n/g, LF);
      p = p.replace(/\\t/g, '\t');
      p = p.replace(/\\`/g, '`');
    }

    // TODO(DH): Add on the wordsep here?
    return p;
  });

  return lines.filter(ln => ln != null).join(LF);
}

function deline(strings, ...values) {
  const resultArr = [];
  let wordSeparatorNeeded = false;
  const appendToResult = (s, isWord) => {
    if (s === '') {
      return;
    }
    if (wordSeparatorNeeded) {
      resultArr.push(wordSeparator);
    }
    resultArr.push(s);
    wordSeparatorNeeded = isWord && !endsWithEscapedWhitespace(s)
  };

  let stringsArr;
  let raw;
  if (typeof strings === 'string') {
    // Apart from the Tagged Template Literal language feature, deline has
    // another mode of operation where it can be used as a normal function with
    // a single string argument.
    stringsArr = [strings];
    raw = false;
  } else {
    stringsArr = strings.raw;
    raw = true;
  }

  stringsArr.forEach((s) => {
    appendToResult(processString(s, raw), true);

    if (values.length) {
      appendToResult(values.shift().toString(), false);
    }
  });

  return resultArr.join('');
}

module.exports = deline;
