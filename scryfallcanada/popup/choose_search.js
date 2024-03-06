/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
    document.addEventListener("click", (e) => {
        /**
        * Given the name of a beast, get the URL to the corresponding image.
        * How to open new tab in url : https://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window
        */
        function beastNameToURL(beastName) {
            switch (beastName) {
                case "Frog":
                    return browser.runtime.getURL("beasts/frog.jpg");
                case "Snake":
                    return browser.runtime.getURL("beasts/snake.jpg");
                case "Turtle":
                    return browser.runtime.getURL("beasts/turtle.jpg");
            }
        }

        /**
        * Insert the page-hiding CSS into the active tab,
        * then get the beast URL and
        * send a "beastify" message to the content script in the active tab.
        */
        function beastify(tabs) {
            browser.tabs.insertCSS({ code: hidePage }).then(() => {
                const url = beastNameToURL(e.target.textContent);
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "beastify",
                    beastURL: url,
                });
            });
        }

        /**
        * Just log the error to the console.
        */
        function reportError(error) {
            console.error(`Could not search for card: ${error}`);
        }

        /**
         * If not a click on the button do nothing, otherwise, open new tab with appropriate search query
         */
        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            // Ignore when click is not on a button within <div id="popup-content">.
            return;
        }
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(beastify)
            .catch(reportError);
    });
}

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browser.tabs
    .executeScript({ file: "/content_scripts/beastify.js" })
    .then(listenForClicks)
    .catch(reportExecuteScriptError);
