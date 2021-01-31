import {internalError} from "../../common/Tools";

const SHEET_ID = 'dynamic-animation-style-sheet';


function initDynamicAnimations() {
    if ( document.getElementById(SHEET_ID) ) {
        return;
    }
    const sheet: HTMLStyleElement = document.createElement('style');
    sheet.setAttribute('id', SHEET_ID);
    document.head.appendChild(sheet);
}


function getStyleSheet(): CSSStyleSheet {
    let styleElement = document.getElementById(SHEET_ID) as HTMLStyleElement;
    if ( ! styleElement?.sheet ) {
        initDynamicAnimations();
        styleElement = document.getElementById(SHEET_ID) as HTMLStyleElement;
    }
    if ( ! styleElement?.sheet ) {
        internalError("Failed to initialize Dynamic Animation!");
    }
    return styleElement.sheet;
}


export function addKeyFrames(name: string, keyframes: string): void {
    const sheet = getStyleSheet();
    sheet.insertRule("@keyframes " + name + " { " + keyframes + " }");
}

export function removeKeyFrames(name: string): void {
    const sheet = getStyleSheet();
    if (sheet.cssRules) {
        const cssPrefix = '@keyframes ' + name + ' ';
        for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i];
            if (rule.cssText.startsWith(cssPrefix)) {
                sheet.deleteRule(i);
                return;
            }
        }
    }
    internalError("Tried to delete CSS rule '" + name + "', but failed to find it!");
}
