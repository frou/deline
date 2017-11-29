import { expect } from 'chai';

// eslint-disable-next-line import/no-unresolved, import/extensions
import deline from '../deline.js';

describe('deline', () => {
  it('works without interpolation', () => {
    const result = deline`some
      text with
      newlines`;
    expect(result).to.eql('some text with newlines');
  });

  it('works with interpolation', () => {
    const result = deline`first ${'line'}
                      ${'second'}
                      third`;
    expect(result).to.eql('first line second third');
  });

  it('works with blank first line', () => {
    const result = deline`
      Lorem ipsum
      dolor sit amit
    `;

    expect(result).to.eql('Lorem ipsum dolor sit amit');
  });

  it('works with multiple blank first lines', () => {
    const result = deline`

                    first
                    second
                    third`;
    expect(result).to.eql('first second third');
  });

  it('turns a double newline into a single newline', () => {
    const result = deline`
      It is wednesday

      my dudes
    `;
    expect(result).to.eql('It is wednesday\nmy dudes');
  });

  it('turns more than 2 newlines into a single newline', () => {
    const result = deline`
      It is wednesday






      my dudes
    `;
    expect(result).to.eql('It is wednesday\nmy dudes');
  });

  describe('single line input', () => {
    const expected = 'A single line of input.';

    it('works with single line input', () => {
      const result = deline`A single line of input.`;
      expect(result).to.eql(expected);
    });

    it('works with single line and closing backtick on newline', () => {
      const result = deline`
        A single line of input.
      `;
      expect(result).to.eql(expected);
    });

    it('works with single line and inline closing backtick', () => {
      const result = deline`
        A single line of input.`;
      expect(result).to.eql(expected);
    });
  });

  describe('use as a normal function', () => {
    it('removes newlines and indentation', () => {
      const arg = `
        A test argument.
      `;
      expect(deline(arg)).to.eql('A test argument.');
    });

    it('correctly treats its no longer "raw" string argument', () => {
      const arg = 'these are backslashes, \\no\\t lf/tab escape sequences\\\\n';
      expect(deline(arg)).to.eql(
        'these are backslashes, \\no\\t lf/tab escape sequences\\\\n');
    });
  });

  it('escapes backticks', () => {
    expect(deline`\``).to.eql('`');
  });

  it('doesn’t strip exlicit newlines', () => {
    const result = deline`
      <p>Hello world!</p>\n
    `;
    expect(result).to.eql('<p>Hello world!</p>\n');
  });

  describe('word separator insertion', () => {
    it('maintains word separation when needed', () => {
      const result = deline`
        going to
        the moon
      `;
      expect(result).to.eql('going to the moon');
    });

    it('is elided immediately after explicit trailing whitespace', () => {
      const result = deline`
        we\tare\t
        tab\tseparated.\n
        true that
      `;
      expect(result).to.eql('we\tare\ttab\tseparated.\ntrue that');
    });

    it("doesn't separate values from strings", function() {
      const result = deline`GT${85}`
      expect(result).to.eql("GT85")
    })

    it("doesn't separate strings from values", function() {
      const result = deline`${40}WD`
      expect(result).to.eql("40WD")
    })

    it("doesn't separate values from values", function() {
      const result = deline`${10*2}${97}`
      expect(result).to.eql("2097")
    })

  });
});
