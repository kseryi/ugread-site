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
  base: Blockly.Themes.Classic,
  blockStyles: {
    loop_blocks: {
      colourPrimary:   "#FFAA00",
      colourSecondary: '#cf8b04',
      colourTertiary:  '#cf8b04'
    },
    math_blocks: {
      colourPrimary:   "#10b981",
      colourSecondary: "#039c69",
      colourTertiary:  '#039c69'
    },
    logic_blocks: {
      colourPrimary:   "#FFAA00",
      colourSecondary: "#cf8b04",
      colourTertiary:  "#cf8b04"
    },
    procedure_blocks: {
      colourPrimary: "#a855f7",
      colourSecondary: "#7c3aed",
      colourTertiary: "#6d28d9",
      hat: false
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
    
    Blockly.Blocks['controls_repeat_ext'].setColour('#f97316');
    Blockly.Blocks['controls_whileUntil'].setColour('#0ea5e9');
    
    // ===================== Динамічне фарбування лівої панелі =====================
    function updateToolboxColors() {
        const toolboxDiv = document.querySelector('.blocklyToolboxDiv');
        if (toolboxDiv) toolboxDiv.style.backgroundColor = '#1e40af';

        const labels = document.querySelectorAll('.blocklyTreeLabel');
        labels.forEach(l => {
            l.style.color = '#facc15';
            l.style.fontWeight = 'bold';
        });
    }

    setTimeout(updateToolboxColors, 100);
}

// ================= BLOCKS & GENERATORS =================
function defineBlocksAndGenerators() {
    Blockly.defineBlocksWithJsonArray([
        { type: "import_turtle", message0: "🚩 import turtle", previousStatement: null, nextStatement: null, colour: '#e8b202', tooltip: "Початок програми", hat: "cap" },
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
        { type: "t_circle", message0: "Circle radius %1", args0: [{ type: "input_value", name: "R", check: "Number" }], previousStatement: null, nextStatement: null, colour: 230 },
        
        // Функції з параметрами
        // Функції з параметрами
{ 

  type: "define_function",
  message0: "Define function %1 parameters: %2\n do %3",
  style: "procedure_blocks",
  inputsInline: false,
  args0: [
    { type: "field_input", name: "FUNC_NAME", text: "myfunc" },
    { type: "field_input", name: "PARAMS", text: "" },
    { type: "input_statement", name: "BODY" }
  ],
  previousStatement: null,
  nextStatement: null,
  tooltip: "Створити функцію з параметрами (через кому)"
},

        
        { type: "call_function", message0: "Call %1 arguments: %2", 
          args0: [
            { type: "field_dropdown", name: "FUNC", options: [[ "(none)", "" ]] },
            { type: "field_input", name: "ARGS", text: "" }
          ], 
          previousStatement: null, nextStatement: null, colour: "#a855f7", tooltip: "Викликати функцію з аргументами (через кому)" },
        
        { type: "function_parameter", message0: "parameter %1", 
          args0: [
            { type: "field_dropdown", name: "PARAM_NAME", options: [[ "(no params)", "" ]] }
          ], 
          output: null, colour: "#a855f7", tooltip: "Параметр функції" },
        
        // Fill color blocks
        { type: "t_fillcolor_manual", message0: "Fill color (manual) %1", args0: [{ type: "input_value", name: "COLOR", check: "String" }], previousStatement: null, nextStatement: null, colour: "#22c55e", tooltip: "Задати колір заливки вручну" },
        { type: "t_fillcolor_list", message0: "Fill color %1", args0: [{ type: "field_dropdown", name: "COLOR", options: [
            ["red", "red"], ["blue", "blue"], ["green", "green"], ["yellow", "yellow"], ["orange", "orange"], 
            ["purple", "purple"], ["pink", "pink"], ["brown", "brown"], ["black", "black"], ["white", "white"], 
            ["gray", "gray"], ["cyan", "cyan"], ["magenta", "magenta"], ["gold", "gold"], ["silver", "silver"],
            ["lime", "lime"], ["navy", "navy"], ["maroon", "maroon"], ["olive", "olive"], ["teal", "teal"]
        ]}], previousStatement: null, nextStatement: null, colour: "#22c55e", tooltip: "Вибрати колір заливки зі списку" },
        { type: "t_begin_fill", message0: "Begin fill", previousStatement: null, nextStatement: null, colour: "#22c55e", tooltip: "Почати заливку" },
        { type: "t_end_fill", message0: "End fill", previousStatement: null, nextStatement: null, colour: "#22c55e", tooltip: "Завершити заливку" }
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
            target = target.getNextBlock();
        }
        return code;
    };

    const gen = Blockly.Python;

    // Turtle basic commands
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

    // Fill color generators
    gen['t_fillcolor_manual'] = function(block) {
        const v = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_NONE) || '"black"';
        const quoted = (/^['"]/.test(v) ? v : `"${v}"`);
        return `${currentTurtleName}.fillcolor(${quoted})\n`;
    };
    gen['t_fillcolor_list'] = function(block) {
        const color = block.getFieldValue('COLOR');
        return `${currentTurtleName}.fillcolor("${color}")\n`;
    };
    gen['t_begin_fill'] = () => `${currentTurtleName}.begin_fill()\n`;
    gen['t_end_fill'] = () => `${currentTurtleName}.end_fill()\n`;

    // Import blocks
    Blockly.Blocks['import_random'] = {
        init: function() {
            this.appendDummyInput().appendField("import random");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#e8b202');
            this.setTooltip("Імпортує модуль random");
        }
    };
    gen['import_random'] = () => "import random\n";

    Blockly.Blocks['import_math'] = {
        init: function() {
            this.appendDummyInput().appendField("import math");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#e8ba02');
            this.setTooltip("Імпортує модуль math");
        }
    };
    gen['import_math'] = () => "import math\n";

    // Turtle shape
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
        }
    };
    gen['turtle_shape'] = block => `${currentTurtleName}.shape("${block.getFieldValue('SHAPE')}")\n`;

    // Print and text
    Blockly.Blocks['print'] = {
        init: function() {
            this.appendValueInput("VALUE").setCheck(null).appendField("print");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#8059ff');
            this.setTooltip("Виводить текст, число або вираз у консоль");
        }
    };
    gen['print'] = block => `print(${Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '""'})\n`;

    Blockly.Blocks['text_literal'] = {
        init: function() {
            this.appendDummyInput().appendField(new Blockly.FieldTextInput("текст"), "TEXT");
            this.setOutput(true, "String");
            this.setColour('#22c55e');
            this.setTooltip("Рядковий літерал");
        }
    };
    gen['text_literal'] = block => {
        const text = block.getFieldValue('TEXT') || "";
        const safe = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return [`"${safe}"`, Blockly.Python.ORDER_ATOMIC];
    };

    // Math blocks
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

    // Logic blocks
    gen['logic_compare'] = block => {
        const OPERATORS = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' };
        const op = OPERATORS[block.getFieldValue('OP')];
        const arg0 = gen.valueToCode(block, 'A', gen.ORDER_NONE) || '0';
        const arg1 = gen.valueToCode(block, 'B', gen.ORDER_NONE) || '0';
        return `(${arg0} ${op} ${arg1})`;
    };
    gen['logic_boolean'] = block => (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';

    // Control structures
    gen['controls_if'] = block => {
        const cond = gen.valueToCode(block, 'IF0', gen.ORDER_NONE) || 'False';
        let branch = gen.statementToCode(block, 'DO0') || '    pass\n';
        branch = branch.split('\n').filter(line => line.trim() !== '').map(line => '    ' + line).join('\n') + '\n';
        return `if ${cond}:\n${branch}`;
    };

    gen['controls_ifelse'] = block => {
        const cond = gen.valueToCode(block, 'IF0', gen.ORDER_NONE) || 'False';
        let branchIf = gen.statementToCode(block, 'DO0') || '    pass\n';
        let branchElse = gen.statementToCode(block, 'ELSE') || '    pass\n';
        const indent = code => code.split('\n').filter(line => line.trim() !== '').map(line => '    ' + line).join('\n') + '\n';
        branchIf = indent(branchIf);
        branchElse = indent(branchElse);
        return `if ${cond}:\n${branchIf}else:\n${branchElse}`;
    };

    gen['controls_whileUntil'] = block => {
        const mode = block.getFieldValue('MODE');
        let cond = gen.valueToCode(block, 'BOOL', gen.ORDER_NONE) || 'False';
        if (mode === 'UNTIL') cond = `not (${cond})`;
        let branch = gen.statementToCode(block, 'DO') || '    pass\n';
        branch = branch.split('\n').map(l => l ? '    ' + l : l).join('\n');
        return `while ${cond}:\n${branch}`;
    };

    gen['controls_repeat_ext'] = block => {
        const repeats = gen.valueToCode(block, 'TIMES', gen.ORDER_NONE) || '0';
        const branch = gen.statementToCode(block, 'DO') || '    pass\n';
        const bs = branch.split('\n').map(l => l ? '    ' + l : l).join('\n');
        let code = `for _ in range(${repeats}):\n${bs}\n`;
        const next = block.getNextBlock();
        if (next) code += simpleBlockToCode(next);
        return code;
    };

    // Function blocks
    gen['define_function'] = function(block) {
        const func = block.getFieldValue("FUNC_NAME");
        const params = block.getFieldValue("PARAMS") || "";
        const cleanParams = params.split(',').map(p => p.trim()).filter(p => p !== "").join(', ');
        let body = Blockly.Python.statementToCode(block, "BODY") || "";
        
        if (!body.trim()) {
            body = "    pass\n";
        } else {
            body = body.split('\n').filter(line => line.trim() !== "").map(line => "    " + line).join('\n') + "\n";
        }
        return `def ${func}(${cleanParams}):\n${body}`;
    };

    gen['call_function'] = function(block) {
        const func = block.getFieldValue("FUNC");
        const args = block.getFieldValue("ARGS") || "";
        if (!func) return "";
        const cleanArgs = args.split(',').map(a => a.trim()).filter(a => a !== "").join(', ');
        return `${func}(${cleanArgs})\n`;
    };

    gen['function_parameter'] = function(block) {
        const paramName = block.getFieldValue('PARAM_NAME');
        return [paramName, Blockly.Python.ORDER_ATOMIC];
    };

    function simpleBlockToCode(block) {
        if (!block) return '';
        const t = block.type;
        let code = '';
        if (Blockly.Python[t]) {
            code += Blockly.Python[t](block);
        }
        const statementBlocks = ['controls_repeat_ext', 'if', 'if_else', 'while'];
        if (!statementBlocks.includes(t)) {
            const next = block.getNextBlock();
            if (next) code += simpleBlockToCode(next);
        }
        return code;
    }

    // ==========================================================
    //               ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ ФУНКЦІЙ
    // ==========================================================

    // Отримати імена визначених функцій
    function getDefinedFunctionNames() {
        if (!workspace) return [];
        return workspace.getAllBlocks(false)
            .filter(b => b.type === "define_function")
            .map(b => b.getFieldValue("FUNC_NAME"))
            .filter(n => n);
    }

    // Отримати параметри конкретної функції
    function getFunctionParameters(funcBlock) {
        if (funcBlock.type !== 'define_function') return [];
        const params = funcBlock.getFieldValue('PARAMS') || '';
        return params.split(',')
            .map(p => p.trim())
            .filter(p => p !== "")
            .map(p => [p, p]);
    }

    // Знайти батьківську функцію для блоку
    function findParentFunction(block) {
        let current = block.getParent();
        while (current) {
            if (current.type === 'define_function') {
                return current;
            }
            current = current.getParent();
        }
        return null;
    }

    // ==========================================================
    //         ОНОВЛЕННЯ WORKSPACE LISTENER
    // ==========================================================

    workspace.addChangeListener(() => {
        const blocks = workspace.getAllBlocks(false);
        
        blocks.forEach(b => {
            // Оновлюємо виклики функцій
            if (b.type === "call_function") {
                const field = b.getField("FUNC");
                const names = getDefinedFunctionNames();
                const menu = names.length ? names.map(n => [n, n]) : [["(none)", ""]];
                field.menuGenerator_ = menu;
                if (!menu.map(m => m[1]).includes(field.getValue())) {
                    field.setValue(menu[0][1]);
                }
            }
            
            // Оновлюємо параметри в блоках параметрів
            if (b.type === "function_parameter") {
                const field = b.getField("PARAM_NAME");
                const parentFunc = findParentFunction(b);
                const params = parentFunc ? getFunctionParameters(parentFunc) : [["(no params)", ""]];
                field.menuGenerator_ = params;
                if (!params.map(p => p[1]).includes(field.getValue())) {
                    field.setValue(params[0] ? params[0][1] : "");
                }
            }
        });
    });
}

// ================= REFRESH CODE =================
function refreshCode() {
    if (!Blockly || !Blockly.Python) return;
    try {
        let code = Blockly.Python.workspaceToCode(workspace) || '';
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
