// ================= GLOBALS =================
let workspace;
let currentTurtleName = 't';

// output area
const outEl = document.getElementById('output');
function outf(text) { outEl.textContent += text; }

// Skulpt read helper
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined)
        throw new Error("File not found: " + x);
    return Sk.builtinFiles['files'][x];
}

// Clear output and turtle area
function clearTurtle() {
    outEl.textContent = '';
    const ta = document.getElementById('turtle-area');
    ta.innerHTML = '';
    currentTurtleName = 't';
    if (Sk && Sk.TurtleGraphics && typeof Sk.TurtleGraphics.reset === 'function') {
        try { Sk.TurtleGraphics.reset(); } catch (_) {}
    }
    document.getElementById('status').textContent = 'Ready';
}

const MyTheme = Blockly.Theme.defineTheme('mytheme', {
  base: Blockly.Themes.Classic, // або Blockly.Themes.Dark, якщо хочеш темну
  blockStyles: {
    loop_blocks: {
      colourPrimary:   "#FFAA00",
      colourSecondary: '#cf8b04',
      colourTertiary:  '#cf8b04'
    },
    math_blocks: {
      colourPrimary:   "#10b981", // Математика → зелений
      colourSecondary: "#039c69",
      colourTertiary:  '#039c69'
    },
    logic_blocks: { // 🟠 додаємо стиль логіки
      colourPrimary:   "#FFAA00",
      colourSecondary: "#cf8b04",
      colourTertiary:  "#cf8b04"
    }
  }
});



// ================= INITIALIZE BLOCKLY =================
function initializeWorkspace() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        renderer: 'zelos',
        scrollbars: true,
        trashcan: true,
        collapse: true,
        sounds: false,
        grid: { spacing: 20, length: 3, colour: '#1f2937', snap: true },
        zoom: { controls: true, wheel: true },
        theme: MyTheme,
        
    });

    const blocklyArea = document.getElementById('blocklyArea');
    const blocklyDiv = document.getElementById('blocklyDiv');

    function onResize() {
        const r = blocklyArea.getBoundingClientRect();
        blocklyDiv.style.left = '0px';
        blocklyDiv.style.top = '0px';
        blocklyDiv.style.width = r.width + 'px';
        blocklyDiv.style.height = r.height + 'px';
        Blockly.svgResize(workspace);
    }

    window.addEventListener('resize', onResize);
    onResize();

    defineBlocksAndGenerators();
    workspace.addChangeListener(refreshCode);
    refreshCode();
    
    Blockly.Blocks['controls_repeat_ext'].setColour('#f97316');  // помаранчевий
    Blockly.Blocks['controls_whileUntil'].setColour('#0ea5e9');  // блакитний
    
    
    // ===================== Динамічне фарбування лівої панелі =====================
function updateToolboxColors() {
    const toolboxDiv = document.querySelector('.blocklyToolboxDiv');
    if (toolboxDiv) toolboxDiv.style.backgroundColor = '#1e40af'; // фон панелі

    const labels = document.querySelectorAll('.blocklyTreeLabel');
labels.forEach(l => {
    l.style.color = '#facc15';   // жовтий текст
    l.style.fontWeight = 'bold'; // додатково можна зробити жирним
});

}

// спочатку почекати, поки Blockly намалює toolbox
setTimeout(updateToolboxColors, 100);


    
}

// ================= BLOCKS & GENERATORS =================
function defineBlocksAndGenerators() {
    Blockly.defineBlocksWithJsonArray([
        { type: "import_turtle", message0: "🚩 Start (import turtle)", nextStatement: null, colour: '#e8b202', tooltip: "Початок програми", hat: "cap" },
        { type: "create_turtle", message0: "Create Turtle as %1", args0: [{ type: "field_input", name: "NAME", text: "t" }], previousStatement: null, nextStatement: null, colour: '#e8b202', tooltip: "Створити нового черепаху" },
        { type: "set_speed", message0: "Set %1 speed %2", args0: [{ type: "field_input", name: "NAME", text: "t" }, { type: "input_value", name: "SPEED", check: "Number" }], previousStatement: null, nextStatement: null, colour: '#e8b202'},
        { type: "t_forward", message0: "Move forward %1", args0: [{ type: "input_value", name: "DIST", check: "Number" }], previousStatement: null, nextStatement: null, colour: '#343BBA' },
        { type: "t_backward", message0: "Move backward %1", args0: [{ type: "input_value", name: "DIST", check: "Number" }], previousStatement: null, nextStatement: null, colour: '#343BBA' },
        { type: "t_left", message0: "Turn left %1°", args0: [{ type: "input_value", name: "ANGLE", check: "Number" }], previousStatement: null, nextStatement: null, colour: '#343BBA'},
        { type: "t_right", message0: "Turn right %1°", args0: [{ type: "input_value", name: "ANGLE", check: "Number" }], previousStatement: null, nextStatement: null, colour: '#343BBA' },
        { type: "t_penup", message0: "Pen up", previousStatement: null, nextStatement: null, colour: "#22c55e" },
        { type: "t_pendown", message0: "Pen down", previousStatement: null, nextStatement: null, colour:"#22c55e"},
        { type: "t_pensize", message0: "Set pen size %1", args0: [{ type: "input_value", name: "SIZE", check: "Number" }], previousStatement: null, nextStatement: null, colour: "#22c55e" },
        { type: "t_color", message0: "Set pen color %1", args0: [{ type: "input_value", name: "COLOR", check: "String" }], previousStatement: null, nextStatement: null, colour: "#22c55e" },
        { type: "t_square", message0: "Square side %1", args0: [{ type: "input_value", name: "A", check: "Number" }], previousStatement: null, nextStatement: null, colour: 230 },
        { type: "t_circle", message0: "Circle radius %1", args0: [{ type: "input_value", name: "R", check: "Number" }], previousStatement: null, nextStatement: null, colour: 230 }
       
    ]);

    if (!Blockly.Python) {
        console.warn('Blockly.Python generator is not present.');
        Blockly.Python = {
            workspaceToCode: function (ws) {
                const top = ws.getTopBlocks(true);
                let out = '';
                top.forEach(b => { out += simpleBlockToCode(b); });
                return out;
            },
            valueToCode: function(block, name) {
                const inputBlock = block.getInputTargetBlock(name) || (block.getInput(name)?.connection?.targetBlock());
                if (!inputBlock) return '0';
                const fv = inputBlock.getFieldValue('NUM') || inputBlock.getFieldValue('TEXT') || null;
                if (fv !== null) return fv;
                return simpleBlockToCode(inputBlock).trim();
            },
            ORDER_NONE: 0
        };
    }

    // ========== FIXED statementToCode ==========
    Blockly.Python.statementToCode = function(block, name) {
        let target = block.getInputTargetBlock(name);
        if (!target) return '';
        let code = '';
        while (target) {
            const t = target.type;
            if (Blockly.Python[t]) {
                code += Blockly.Python[t](target);
            }
            // переміщаємось по next тільки всередині DO, без рекурсії simpleBlockToCode
            target = target.getNextBlock();
        }
        return code;
    };

    const gen = Blockly.Python;

    gen['import_turtle'] = () => 'import turtle\n';
    gen['create_turtle'] = block => {
        currentTurtleName = block.getFieldValue('NAME') || 't';
        return `${currentTurtleName} = turtle.Turtle()\n`;
    };
    gen['set_speed'] = block => `${block.getFieldValue('NAME') || currentTurtleName}.speed(${gen.valueToCode(block, 'SPEED', gen.ORDER_NONE) || 0})\n`;
    gen['t_forward'] = block => `${currentTurtleName}.forward(${gen.valueToCode(block, 'DIST', gen.ORDER_NONE) || 0})\n`;
    gen['t_backward'] = block => `${currentTurtleName}.backward(${gen.valueToCode(block, 'DIST', gen.ORDER_NONE) || 0})\n`;
    gen['t_left'] = block => `${currentTurtleName}.left(${gen.valueToCode(block, 'ANGLE', gen.ORDER_NONE) || 0})\n`;
    gen['t_right'] = block => `${currentTurtleName}.right(${gen.valueToCode(block, 'ANGLE', gen.ORDER_NONE) || 0})\n`;
    gen['t_penup'] = () => `${currentTurtleName}.penup()\n`;
    gen['t_pendown'] = () => `${currentTurtleName}.pendown()\n`;
    gen['t_pensize'] = block => `${currentTurtleName}.pensize(${gen.valueToCode(block, 'SIZE', gen.ORDER_NONE) || 1})\n`;
    gen['t_color'] = block => {
        const v = gen.valueToCode(block, 'COLOR', gen.ORDER_NONE) || '"black"';
        const quoted = (/^['"]/.test(v) ? v : `"${v}"`);
        return `${currentTurtleName}.pencolor(${quoted})\n`;
    };
    gen['t_square'] = block => {
        const a = gen.valueToCode(block, 'A', gen.ORDER_NONE) || 50;
        return `for _ in range(4):\n    ${currentTurtleName}.forward(${a})\n    ${currentTurtleName}.right(90)\n`;
    };
    gen['t_circle'] = block => `${currentTurtleName}.circle(${gen.valueToCode(block, 'R', gen.ORDER_NONE) || 50})\n`;
   
   //========================================
   
   // === Import random ===
Blockly.Blocks['import_random'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("import random");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#e8b202');
    this.setTooltip("Імпортує модуль random");
    this.setHelpUrl("");
  }
};

gen['import_random'] = function(block) {
  return "import random\n";
};

// ======= BLOCK =======
Blockly.Blocks['turtle_shape'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turtle shape")
        .appendField(new Blockly.FieldDropdown([
          ["turtle", "turtle"],
          ["circle", "circle"],
          ["arrow", "arrow"]
        ]), "SHAPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#e8b202');
    this.setTooltip("Змінює форму черепашки");
    this.setHelpUrl("");
  }
};

// ======= GENERATOR =======
Blockly.Python['turtle_shape'] = function(block) {
  const shape = block.getFieldValue('SHAPE');
  return `${currentTurtleName}.shape("${shape}")\n`;
};


// ======= BLOCK =======
Blockly.Blocks['print'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .setCheck(null)   // <-- дозволяє будь-що (і число, і текст, і вираз)
        .appendField("print");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8059ff'); // оранжевий
    this.setTooltip("Виводить текст, число або вираз у консоль");
    this.setHelpUrl("");
  }
};

// ======= GENERATOR =======
Blockly.Python['print'] = function(block) {
  const val = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '""';
  return `print(${val})\n`;
};

// ======= BLOCK =======
Blockly.Blocks['text_literal'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("текст"), "TEXT");
    this.setOutput(true, "String");  // блок видає значення типу String
    this.setColour('#22c55e');      // зелений (можна інший)
    this.setTooltip("Рядковий літерал: будь-який текст, який автоматично береться в лапки");
    this.setHelpUrl("");
  }
};

// ======= GENERATOR =======
Blockly.Python['text_literal'] = function(block) {
  const text = block.getFieldValue('TEXT') || "";
  // Екрануємо лапки всередині
  const safe = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [`"${safe}"`, Blockly.Python.ORDER_ATOMIC];
};



   
   // === Math ===
gen['math_number'] = block => block.getFieldValue('NUM');
gen['math_arithmetic'] = block => {
    const OPERATORS = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: '**' };
    const op = OPERATORS[block.getFieldValue('OP')];
    const arg0 = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '0';
    const arg1 = gen.valueToCode(block, 'B', gen.ORDER_NONE) || '0';
    return `(${arg0} ${op} ${arg1})`;
};
gen['math_random_int'] = block => {
    const from = gen.valueToCode(block, 'FROM', gen.ORDER_NONE) || '0';
    const to = gen.valueToCode(block, 'TO', gen.ORDER_NONE) || '10';
    return `random.randint(${from}, ${to})`;
};

// === Logic ===
gen['logic_compare'] = block => {
    const OPERATORS = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' };
    const op = OPERATORS[block.getFieldValue('OP')];
    const arg0 = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '0';
    const arg1 = gen.valueToCode(block, 'B', gen.ORDER_NONE) || '0';
    return `(${arg0} ${op} ${arg1})`;
    this.setColour('#8059ff'); // оранжевий
};
gen['logic_boolean'] = block => (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';

gen['controls_if'] = block => {
    const cond = gen.valueToCode(block, 'IF0', gen.ORDER_NONE) || 'False';
    let branch = gen.statementToCode(block, 'DO0') || '    pass\n';
    branch = branch
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => '    ' + line)
        .join('\n') + '\n';
    return `if ${cond}:\n${branch}`;
};

gen['controls_ifelse'] = block => {
    const cond = gen.valueToCode(block, 'IF0', gen.ORDER_NONE) || 'False';
    let branchIf = gen.statementToCode(block, 'DO0') || '    pass\n';
    let branchElse = gen.statementToCode(block, 'ELSE') || '    pass\n';

    // Додаємо відступ у кожен рядок тіла блоку
    const indent = code =>
        code
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => '    ' + line)
            .join('\n') + '\n';

    branchIf = indent(branchIf);
    branchElse = indent(branchElse);

    return `if ${cond}:\n${branchIf}else:\n${branchElse}`;
};

gen['controls_whileUntil'] = block => {
    const mode = block.getFieldValue('MODE'); // WHILE або UNTIL
    let cond = gen.valueToCode(block, 'BOOL', gen.ORDER_NONE) || 'False';
    if (mode === 'UNTIL') cond = `not (${cond})`;

    // Беремо тіло DO
    let branch = gen.statementToCode(block, 'DO') || '    pass\n';
    
    // Вирівнюємо відступи
    branch = branch.split('\n').map(l => l ? '    ' + l : l).join('\n');

    return `while ${cond}:\n${branch}`;
};




   
   //========================================
   
   gen['controls_repeat_ext'] = block => {
    const repeats = gen.valueToCode(block, 'TIMES', gen.ORDER_NONE) || '0';
    const branch = gen.statementToCode(block, 'DO') || '    pass\n';
    const bs = branch.split('\n').map(l => l ? '    ' + l : l).join('\n');
    let code = `for _ in range(${repeats}):\n${bs}\n`;

    // 🔥 Додаємо підтримку nextBlock після циклу
    const next = block.getNextBlock();
    if (next) code += simpleBlockToCode(next);

    return code;
};

    function simpleBlockToCode(block) {
        if (!block) return '';
        const t = block.type;
        let code = '';
        if (Blockly.Python[t]) {
            code += Blockly.Python[t](block);
        }
        // Обробляємо next тільки якщо блок не statement
        const statementBlocks = ['controls_repeat_ext', 'if', 'if_else', 'while'];
        if (!statementBlocks.includes(t)) {
            const next = block.getNextBlock();
            if (next) code += simpleBlockToCode(next);
        }
        return code;
    }
}

// ================= REFRESH CODE =================
function refreshCode() {
    if (!Blockly || !Blockly.Python) return;
    try {
        let code = Blockly.Python.workspaceToCode(workspace) || '';
        //if (!/turtle/.test(code)) code = 'import turtle\n' + code;
        document.getElementById('code').value = code || "# add blocks";
    } catch (e) {
        document.getElementById('code').value = "# Помилка генерації: " + e;
        console.error(e);
    }
}

// ================= RUN CODE (Skulpt) =================
async function runCode() {
    clearTurtle();
    const code = document.getElementById('code').value;
    document.getElementById('status').textContent = 'Running...';

    Sk.configure({ output: outf, read: builtinRead });
    Sk.TurtleGraphics = { target: 'turtle-area', width: 600, height: 420 };

    try {
        await Sk.misceval.asyncToPromise(() =>
            Sk.importMainWithBody("<stdin>", false, code, true)
        );
        document.getElementById('status').textContent = 'Execution completed';
    } catch (e) {
        outf('\n[Execution Error] ' + e.toString());
        document.getElementById('status').textContent = 'Execution error';
        console.error(e);
    }
}

// ================= EXAMPLE =================
function loadExample() {
    workspace.clear();
 // ================= EXAMPLE =================// ================= EXAMPLE =================// ================= EXAMPLE =================   
    const xmlDom = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xmlDom, workspace);
    refreshCode();
    document.getElementById('status').textContent = 'Example loaded';
}

// ================= BUTTON EVENTS =================
document.getElementById('runBtn').addEventListener('click', runCode);
document.getElementById('stopBtn').addEventListener('click', clearTurtle);
document.getElementById('exampleBtn').addEventListener('click', loadExample);

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {
    if (!window.Blockly) {
        console.error('Blockly is not loaded. Check script include order.');
        document.getElementById('status').textContent = 'Blockly not loaded';
        return;
    }
    initializeWorkspace();
});
