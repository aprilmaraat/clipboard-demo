const electron = require('electron');
const path = require('path');

const { app, clipboard, globalShortcut, Tray, Menu } = electron;
const STACK_SIZE = 5;
const ITEM_MAX_LENGTH = 999;

app.on('ready', _ => {
    let stack = [];
    const tray = new Tray(path.join('src/assets', 'chimp.png'));
    const template = [
        {
            label: '<Empty>',
            enabled: false
        }
    ];
    tray.setContextMenu(Menu.buildFromTemplate(template));

    checkClipboardForChange(clipboard, text => {
        stack = addToStack(text, stack);
        console.log('formatMenuTemplateForStack(stack)', formatMenuTemplateForStack(stack));
        tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(stack)));
        registerShortcuts(globalShortcut, clipboard, stack);
    });
});

function checkClipboardForChange(clipboard, onChange) {
    let cache = clipboard.readText();
    let latest;
    setInterval(_ => {
        latest = clipboard.readText();
        if (latest !== cache) {
            cache = latest;
            onChange(cache);
        }
    });
}

function addToStack(item, stack) {
    return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, stack.length - 1) : stack);
}

function formatMenuTemplateForStack(stack) {
    return stack.map((item, i) => {
        return {
            label: `Copy: ${formatItem(item)}`,
            click: _ => clipboard.writeText(item)
        };
    });
}

function formatItem(item) {
    return item && item.length > ITEM_MAX_LENGTH
    ? item.substr(0, ITEM_MAX_LENGTH) + `...`
    : item;
}

function registerShortcuts(globalShortcut, clipboard, stack) {
    console.log('registerShortcuts', globalShortcut);
    globalShortcut.unregisterAll();
    for (let i = 0; i < STACK_SIZE; i++){
        globalShorcut.register(`Ctrl+Alt+${i + 1}`, _ => {
            clipboard.writeText(stack[i]);
        });
    }
}