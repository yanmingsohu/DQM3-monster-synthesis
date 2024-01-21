const colors = require("colors");
const fs = require("fs");

const detail = {};
const data = {
  //'地龙': ['岩龙', '仇恨的地震剑'],
};

const series = new Set([
  '无', '史莱姆系', '物质系', '自然系', '僵尸系', '魔兽系', '恶魔系', '龙系', '魔王系',
]);

readData();

const {index, len} = makeIndex();

if (!process.argv[2]) {
  help();
  return;
}

const name = index[process.argv[2]] || process.argv[2];

if (!data[name]) {
  console.log("Cannot found: ".red, name, '\n');
  help();
  return;
}

let total = {
  colorList : [],
  _i : 7,
  t: {},
  colorMap: {},
  _p : {},
    
  add(name) {
    if (!this.t[name]) {
      this.t[name] = 1;
    } else {
      this.t[name] += 1;
    }
  },

  isPrinted(name) {
    if (!this._p[name]) {
      this._p[name] = true;
      return false;
    }
    return true;
  },

  color(name) {
    let c = this.colorMap[name];
    if (!c) {
      c = this.colorMap[name] = this.nextColor();
    }
    return colors[c](name);// + c;
  },

  nextColor() {
    let i = this._i++;
    if (this._i >= this.colorList.length) {
      this._i = 0;
    }
    return this.colorList[i];
  },
};

const notUse = new Set([
  'whiteBG', 'black', 'bgWhite', 'bgBrightWhite', 'bgBrightYellow',
]);

for (let n in colors.styles) {
  if (!notUse.has(n))
    total.colorList.push(n);
}


console.log( hc(name, 0, total) );
for (let n in total.t) {
  console.log(series.has(n) ? "* ":'  ', total.color(n), total.t[n],
    ' \t', detail[n] ? detail[n].s.gray : '');
}
console.log(series.has(name) ? "* ":'  ', total.color(name), 
  ' \t', detail[name] ? detail[name].s : '');
  
  
function makeIndex() {
  const index = {};
  let i = 1;  
  let len = 0;
  for (let n in data) {
    index[i++] = n;
    len = Math.max(len, n.length);
  }
  len = len *2 +3;
  return {index, len};
}


function hc(name, s, t) {
  const A = ' + ', E = ' = ';
  let ref = data[name];
  if (ref) {
    let buf = [];
    let buf2 = ['\n'];
    
    if (s > (process.stdout.columns/2)) {
      s = 0;
    } else {
      space(buf, s);
    }
    buf.push(t.color(name), E);
    
    s += charsize(name) + E.length;
    
    for (let i=0; i<ref.length; ++i) {
      let a = ref[i];
      if (a == '无') continue;
      
      t.add(a);
      let ra = hc(a, s, t);
      s += A.length + charsize(a);
      
      if (i > 0) {
        buf.push(A);
      }
      buf.push(t.color(a));
      buf2.push(ra);
    }
    
    if (t.isPrinted(name)) {
      return '';
    }

    return buf.join('') + buf2.join('');
  }
  return '';
}


function help() {
  console.log("Command Line: node index [名字/索引]\n");
  printList();
}


function printList() {
  let buf = [];
  let i = 0;
  for (let n in index) {
    i += space(buf, 4 - charsize(n));
    buf.push(n.underline, ' ');
    
    let s = index[n] +'.'+ detail[index[n]].m[3];
    switch (detail[index[n]].m[3]) {
      case 'S':
        buf.push(s.brightYellow);
        break;
      case 'X':
        buf.push(s.brightMagenta);
        break;
      case 'G':
        buf.push(s.gray);
        break;
      default:
        buf.push(s);
    }
    i += space(buf, len - charsize(s));
    
    i += 4 + len;
    if (i >= process.stdout.columns) {
      buf.push('\n');
      i = 0;
    } 
  }
  console.log(buf.join(''));
}


function space(buf, count) {
  for (let sp = 0; sp < count; ++sp) {
    buf.push(' ');
  }
  return count;
}


function charsize(s) {
  let l = 0;
  for (let i=0; i<s.length; ++i) {
    if (s.charCodeAt(i) > 127) {
      l += 2;
    } else {
      l++;
    }
  }
  return l;
}


function readData() {
  let fd = fs.readFileSync("data.txt", 'utf8');
  let lines = fd.split("\n");
  for (let i=0; i<lines.length; ++i) {
    let m = lines[i].split(',');
    if (m.length > 1) {
      add(m);
    }
  }

  function add(m) {
    data[m[1]] = [m[11], m[12], m[13], m[14]];
    detail[m[1]] = {
      m, 
      s:[
        'No.', m[0],
        //',Name:', m[1],
        ' ', m[2], m[3], '/',m[15].trim(),
        ' HP:', m[4],
        '+MP:', m[5],
        '+Act:', m[6],
        '+Def:', m[7],
        '+Spd:', m[8],
        '+Int:', m[9],
        '=', m[10]
      ].join('')
    };
    //console.log(m)
  }
}


