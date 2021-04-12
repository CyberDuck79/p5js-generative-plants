var back_color = [];
var rod_color = [];
var leaf_color = [];

// root part of the plant
var max_dist = 25;
var min_dist = 5;

class Leaf {
  constructor() {
    var y = random((height / 2) + 172, height - 10);
    var x = random((height - y + 20), width - (height - y) - 20);
    this.pos = createVector(x, y);
    this.reached = false;
  }
}

class Branch {
  constructor(parent, pos, dir) {
    this.pos = pos;
    this.parent = parent;
    this.dir = dir;
    this.origDir = this.dir.copy();
    this.count = 0;
    this.len = 8;

    this.reset = function () {
      this.dir = this.origDir.copy();
      this.count = 0;
    };

    this.next = function () {
      var nextDir = p5.Vector.mult(this.dir, this.len);
      var nextPos = p5.Vector.add(this.pos, nextDir);
      return new Branch(this, nextPos, this.dir.copy());
    };

    this.show = function () {
      if (parent) {
        stroke(rod_color, 100);
        line(this.pos.x, this.pos.y, this.parent.pos.x, this.parent.pos.y);
      }
    };
  }
}

class Roots {
  constructor() {
    this.leaves = [];
    this.branches = [];

    for (var i = 0; i < 1500; i++) {
      this.leaves.push(new Leaf());
    }

    var pos = createVector(width / 2, (height / 2) + 132);
    var dir = createVector(0, 1);
    var root = new Branch(null, pos, dir);
    this.branches.push(root);

    var current = root;
    var found = false;
    while (!found) {
      for (var i = 0; i < this.leaves.length; i++) {
        var d = p5.Vector.dist(current.pos, this.leaves[i].pos);
        if (d < max_dist) {
          found = true;
        }
      }
      if (!found) {
        current = current.next();
        this.branches.push(current);
      }
    }

    this.grow = function () {
      for (var i = 0; i < this.leaves.length; ++i) {
        var leaf = this.leaves[i];
        var closestBranch = null;
        var record = max_dist;
        for (var j = 0; j < this.branches.length; ++j) {
          var branch = this.branches[j];
          var d = p5.Vector.dist(leaf.pos, branch.pos);
          if (d < min_dist) {
            leaf.reached = true;
            closestBranch = null;
            break;
          } else if (d < record) {
            closestBranch = branch;
            record = d;
          }
        }
        if (closestBranch) {
          var newDir = p5.Vector.sub(leaf.pos, closestBranch.pos);
          newDir.normalize();
          closestBranch.dir.add(newDir);
          closestBranch.count++;
        }
      }

      for (var i = this.leaves.length - 1; i >= 0; --i) {
        if (this.leaves[i].reached) {
          this.leaves.splice(i, 1);
        }
      }

      for (var i = this.branches.length - 1; i >= 0; --i) {
        var branch = this.branches[i];
        if (branch.count) {
          branch.dir.div(branch.count + 1);
          this.branches.push(branch.next());
          branch.reset();
        }
      }
    };

    this.show = function () {
      for (var i = 0; i < this.branches.length; i++) {
        this.branches[i].show();
      }
    };
  }
}

// L-system part of the plant
let system = {
  angle_min: 20,
  angle_max: 25.7,
  axiom: "X",
  rules:[["X", // -> 1/10 chance to pick a substitution
    "F[+X]F[-X]+X",
    "F[-X]F[+X]-X",
    "F[+X]F[+X]-X",
    "F[-X]F[-X]+X",
    "F-[[X]+X]+F[+FX]-X",
    "F-[[X]-X]+F[+FX]-X",
    "F-[[X]+X]+F[-FX]-X",
    "F-[[X]+X]+F[+FX]+X",
    "F-[[X]-X]+F[+FX]+X",
    "F-[[X]+X]+F[-FX]+X"
    ],
    ["F","FF"]
  ]
}

let rules = system.rules;
var sentence;
var len;
var angle;


function generate() {
  var next_sentence = "";
  for (var i = 0; i < sentence.length; ++i) {
    var current = sentence.charAt(i);
    var found = false;
    for (var j = 0; j < rules.length; ++j) {
      if (current == rules[j][0]) {
        found = true;
        var substitution = Math.floor(Math.random() * rules[j].length - 1) + 1;
        next_sentence += rules[j][substitution];
        break;
      }
    }
    if (!found) {
      next_sentence += current;
    }
  }
  sentence = next_sentence;  
  len *= 0.58;
}

function turtle() {
  resetMatrix();
  translate(width / 2, (height / 2) + 132);
  strokeWeight(2);
  stroke(rod_color, 120);
  for (var i = 0; i < sentence.length; ++i) {
    var current = sentence.charAt(i);
    if (current == "F") {
      line(0, 0, 0, -len);
      translate(0, -len);
    } else if (current == "+") {
      angle = radians(random(system.angle_min, system.angle_max));
      rotate(angle);
    } else if (current == "-") {
      angle = radians(random(system.angle_min, system.angle_max));
      rotate(-angle);
    } else if (current == "[") {
      push();
    } else if (current == "]") {
      noStroke();
      fill(leaf_color[0], leaf_color[1], leaf_color[2], 90);
      let size = random(12, 16);
      circle(0, 0, size);
      fill(leaf_color);
      circle(0, 0, size - 10);
      pop();
    }
  }
}

// coloring part
let palettes = [
	[[38, 70, 83], [233, 196, 106], [231, 111, 81]],
	[[42, 157, 143], [233, 196, 106], [244, 162, 97]],
	[[230, 57, 70], [168, 218, 220], [29, 53, 87]],
	[[241, 250, 238], [168, 218, 220], [69, 123, 157]],
	[[142, 202, 230], [2, 48, 71], [251, 133, 0]],
	[[33, 158, 188], [2, 48, 71], [255, 183, 3]],
	[[0, 0, 0], [252, 163, 17], [255, 255, 255]],
	[[20, 33, 61], [252, 163, 17], [229, 229, 229]],
	[[244, 241, 222], [61, 64, 91], [242, 204, 143]],
	[[224, 122, 95], [61, 64, 91], [129, 178, 154]],
	[[255, 205, 178], [229, 152, 155], [109, 104, 117]],
	[[255, 180, 162], [229, 152, 155], [181, 131, 141]],
	[[0, 109, 119], [237, 246, 249], [226, 149, 120]],
	[[131, 197, 190], [237, 246, 249], [255, 221, 210]],
	[[51, 92, 103], [224, 159, 62], [84, 11, 14]],
	[[255, 243, 176], [224, 159, 62], [158, 42, 43]],
	[[142, 154, 175], [239, 211, 215], [222, 226, 255]],
	[[203, 192, 211], [239, 211, 215], [254, 234, 250]],
	[[0, 48, 73], [247, 127, 0], [234, 226, 183]],
	[[214, 40, 40], [247, 127, 0], [252, 191, 73]],
	[[0, 129, 167], [253, 252, 220], [240, 113, 103]],
	[[0, 175, 185], [253, 252, 220], [254, 217, 183]],
	[[246, 189, 96], [245, 202, 195], [242, 132, 130]],
	[[247, 237, 226], [245, 202, 195], [132, 165, 157]],
	[[255, 159, 28], [255, 255, 255], [46, 196, 182]],
	[[255, 191, 105], [255, 255, 255], [203, 243, 240]],
	[[43, 45, 66], [237, 242, 244], [217, 4, 41]],
	[[141, 153, 174], [237, 242, 244], [239, 35, 60]],
	[[95, 15, 64], [251, 139, 36], [15, 76, 92]],
	[[154, 3, 30], [251, 139, 36], [227, 100, 20]],
	[[53, 80, 112], [181, 101, 118], [234, 172, 139]],
	[[109, 89, 122], [181, 101, 118], [229, 107, 111]]
];
var seed = 0;

function set_vars() {
  let palette = random(palettes);
  shuffle(palette, true);
  back_color = palette[0];
  rod_color = palette[1];
  leaf_color = palette[2];
  background(back_color);
  sentence = system.axiom;
  len = 196;
}

function new_gen() {
  Math.seedrandom(seed);
  set_vars();
  fill(leaf_color);
  noStroke();
  rect(0, (height / 2) + 148, width, (height / 2) - 110);
  for (var i = 0; i < 6; ++i) {
     generate();
  }
  turtle();
  translate(0, 0);
  resetMatrix();
  var roots = new Roots();
  for (var i = 0; i < 40; ++i) {
     roots.grow();
  }
  roots.show();
}

function mousePressed(event) {
  seed++;
	new_gen();
}

function setup() {
  createCanvas(560,790);
  new_gen();
}
