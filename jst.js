/**
 * Node-jst for browsers
 * Copyright(c) 2011 Shaun Li <shonhen@gmail.com>
 * MIT Licensed
 */

// compiler

window['jst'] = {};

;(function(exports) {

  var htmlCodes = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'},
      htmlre = /&(?!\w+;)|<|>|"/g,
      htmlEscape = function (src) { return htmlCodes[src]; },
      //
      _options = {
        useIt: false
      };

  var filters = exports['filters'] = {};

  function convertFilters(src) {
    return src.split('|').reduce(function(varname, filter) {
        return 'filters.' + filter + '(' + varname + ')';
    });
  }

  filters['e'] = filters['escape'] = function(src) {
    return typeof src !== 'string' ? src : src.replace(htmlre, htmlEscape);
  }

  var prefixes = [
        //  s    ,  c    ,  v
        [''      , '"; ' , '"+'   ] , // s
        ['_o+="' , ''    , '_o+=' ] , // c
        ['+"'    , '; '  , '+'    ] , // v
        ['"'     , ''    , ''     ] , // n
        ['"; '   , ''    , ';'    ] // end
      ],
      codere = /\{[%\{] (.+?) [%\}]\}/g;

  var compile = exports.compile = function(ctx) {
    var m, i = 0, code = 'var _o = ', last = 3 /* n */;

    _options.useIt = /{{ (e\()?it\./.test(ctx);

    ctx = ctx.replace(/[\t\r\n]/g, '').replace(/\{#.+?#\}/g, '')

    if (!_options.useIt) {
      code += '"";with(it){';
      last = 1 /* c */;
    }

    while ((m = codere.exec(ctx)) !== null) {
      if (m.index > 0 && m.index > i) {
        code += prefixes[last][0 /* s */] + ctx.substring(i, m.index).replace(/"/g, '\\"');
        last = 0 /* s */;
      }

      if (m[0].indexOf('{%') === 0) {
        code += prefixes[last][1 /* c */] + m[1];
        if (/\)$/.test(m[1])) code += ';';
        last = 1 /* c */;
      } else if (m[0].indexOf('{{') === 0) {
        code += prefixes[last][2 /* v */] + convertFilters(m[1]);
        last = 2 /* v */;
      }

      i = m.index + m[0].length;
    }

    if (i < ctx.length) {
      code += prefixes[last][0 /* s */] + ctx.substring(i).replace(/"/g, '\\"');
      last = 0 /* s */;
    }

    code += prefixes[4 /* end */][last];

    if (!_options.useIt)
      code += '}';

    code += 'return _o;';
    console.log(code);

    var fn = new Function('it, filters', code);

    return function(args) {
      return fn.call(this, args, filters);
    }
  }

})(jst);

