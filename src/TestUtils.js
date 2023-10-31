import {localStorageMock} from "./LocalStorageMock";
import {unmountComponentAtNode} from "react-dom";

export function testSetUp() {
    let container = null
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    beforeEach(() => {
        // set up a DOM element as a render target
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        // cleanup on exiting
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });
    return container
}
