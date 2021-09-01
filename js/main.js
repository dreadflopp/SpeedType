/*******************************************************************************
 * Projekt, Kurs: DT146G
 * File: main.js
 * Desc: main JavaScript file for project SpeedType
 *
 * Mattias Lindell
 * mali1624
 * mattias.lindell@student.miun.se
 ******************************************************************************/
var speedType = (function() {
    /*
    xmlDocument handles and holds an xml-document

    Public methods:
        load - loads the xml-document
        getXmlDoc - getter for xmlDoc
        numTexts - return the number of texts in the xmlDoc
        find - returns an array with indexes of all matching nodes from a node tree
                of all nodes with the matching tag
            parameter: value - search value
            parameter: tag - tag of the node that is to be included in the search
     */
    var xmlDocument = (function() {

        var xmlDoc;

        /*
         This function loads the xml-document and calls a function to manipulate the
         DOM when the xml is loaded
        */
        function load() {
            

            /* Get XMLHttpRequest object */
            var xhr = new XMLHttpRequest();

            /*
            This function is called every time the ready state of xhr is changed
            The if statement is executed only if the texts are loaded
            */
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    
                    /* Set xmlDoc*/
                    xmlDoc = xhr.responseXML;

                    /* Call functions to manipulate the DOM*/
                    domManipulator.populateTextSelector();
                    domManipulator.selectorsEnabledState(true);

                    /* Get nodeTree with the language radio buttons*/
                    var langRadioButtons = document.getElementsByName('language');

                    /* Iterate through the node tree and add language selector handler to each button*/
                    for(var i = 0; i < langRadioButtons.length; i++) {
                        langRadioButtons[i].onchange=function() { eventHandlers.handleLanguageSelector() };
                    }

                    /* Add handler for changing text to the text selector element*/
                    document.getElementById('selectedText').onchange=function() { eventHandlers.handleTextSelector(this.value) };

                    /* Execute the language selector handler to set the current language*/
                    eventHandlers.handleLanguageSelector();
                }
            };

            /* Load the xml text files*/
            xhr.open('GET', './texts.xml', true);
            xhr.send();
        }

        /* Getter for xmlDoc*/
        function getXmlDoc() { return xmlDoc; }

        /* Returns the numbers of texts in the xml document by counting the number of titles*/
        function numTexts() { return xmlDoc.getElementsByTagName('title').length; }

        /*
         Find nodes with a certain value in the XML document.
         The function uses the fact that the index of the match
         corresponds to the index of all authors, texts, titles and languages
         in the node list returned from getElementsByTagName. Text with index 0 is written
         by the author with index 0 and so on.

         Parameters:
            value: the value you are searching for
            tag: the tag of the node that contains the value (author, title, language...)
         Return:
            Returns an array with indexes of all hits.
        */
        function find(value, tag) {
            /* Array with the index of all matches*/
            var matches = [];

            /* Get all nodes with the tag-name 'tag'*/
            var nodes = xmlDoc.getElementsByTagName(tag);

            /* Iterate through the nodes, push matches to the array 'matches'*/
            for(var i = 0; i < nodes.length; i++) {
                var nodeValue = nodes[i].childNodes[0].nodeValue;
                if (nodeValue === value) {
                    matches.push(i);
                }
            }

            /* Return the result*/
            return matches;
        }

        /* Public*/
        return  {
            load: load,
            getXmlDoc: getXmlDoc,
            numTexts: numTexts,
            find:find
        }
    }());

    /*
    Graph/canvas function expression with several public functions. This object is responsible for
    painting/resetting the graph.
    The x-axis represents time spent in the game.
    The y-axis represents netWPM ranging from -100 to 100.

    Methods:
        addPoints: This function takes two floats as parameters and adds them to an array holding all points
            of the graph
        draw: This function draws the actual graph. It typically only draws a line between the two
             last given pair of points.  The graph zooms out on the x-axis when the graph has reached the
             end of the x-axis. If the scale changes because of this, the  graph will be drawn from scratch.
             If the scale hasn't changed, the function will continue to draw on the graph started in the previous
             function call.
        reset: this function resets the graph and paints the background.
    */
    var graph = (function () {
        /* Array holding all points of the graph */
        var points = [[0,0]];

        /* Settings used when drawing the graph */
        var offsetX = 0;    // positive value offsets right
        var scaleX = 360;

        var offsetY = 50;   // positive value offsets up
        var scaleY = 0.5;


        /* add x and y values */
        function addPoints(x, y) {
            points.push([x, y]);
        }

        /* Draw the graph */
        function draw() {
            /* Get the graph element and CanvasRenderingContext2D */
            var canvas = document.getElementById('graph');
            var context = canvas.getContext('2d');

            /* If the graph is close to the end of the x-axis, lower the scale of the x-axis (=zoom out) */
            var isScaleChanged = false;
            while (points[points.length - 1][0] * scaleX > 295) {
                scaleX *= 0.98;
                isScaleChanged = true;
            }

            /* If scale has changed, the graph is drawn from the start. If not, draw on the existing graph. */
            if (isScaleChanged) {
                /* Reset the graph*/
                graph.reset();
                context.beginPath();
                context.moveTo(points[0][0] * scaleX + offsetX, - points[0][1] * scaleY + offsetY);
                for (var i = 1; i < points.length; i++) {
                    context.lineTo(points[i][0] * scaleX + offsetX, - points[i][1] * scaleY + offsetY);
                }
            } else {
                var lastIndex = points.length - 1;

                var x1 = points[lastIndex - 1][0];
                var y1 = points[lastIndex - 1][1];
                var x2 = points[lastIndex][0];
                var y2 = points[lastIndex][1];

                context.beginPath();
                context.moveTo(x1 * scaleX + offsetX, -y1 * scaleY + offsetY);
                context.lineTo(x2 * scaleX + offsetX, -y2 * scaleY + offsetY);
            }
            context.lineWidth = 1;
            context.lineJoin = "miter";
            context.lineCap = "butt";
            context.strokeStyle = "red";
            context.stroke();
        }

        /* reset graph*/
        function reset() {
            // Remove previous points
            points = [[0,0]];

            /* Get the graph element and CanvasRenderingContext2D*/
            var canvas = document.getElementById('graph');
            var context = canvas.getContext('2d');

            /* Set canvas size*/
            canvas.height = 100;
            canvas.width = 300;

            /* Draw the upper, lower and middle line of the graph*/
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(300,0);
            context.moveTo(0,50);
            context.lineTo(300,50);
            context.moveTo(0,100);
            context.lineTo(300,100);
            context.lineWidth = 2;
            context.lineJoin = "miter";
            context.lineCap = "butt";
            context.strokeStyle = "#000000";
            context.stroke();

            /* Draw the smaller grey lines between the larger black lines*/
            context.beginPath();
            context.moveTo(0,25);
            context.lineTo(300,25);
            context.moveTo(0,75);
            context.lineTo(300,75);
            context.lineWidth = 1;
            context.lineJoin = "miter";
            context.lineCap = "butt";
            context.strokeStyle = "#aaaaaa";
            context.stroke();
        }

        /* Public */
        return {
            addPoints: addPoints,
            draw: draw,
            reset: reset
        }
    }());

    /*
    A timer for the game.

    Methods:
        start: This function sets a new start time
        elapsed seconds: this function returns the currently elapsed time in seconds
            since the timer was reset with start.
    */

    var timer = (function() {
        /* The time the timer started */
        var startTime;

        /* Set new start time */
        function start() { startTime = new Date(); }

        /* Elapsed seconds since timer was started */
        function elapsedSeconds() {
            var currentTime = new Date();
            return (currentTime.getTime() - startTime.getTime()) / 1000;
        }

        /* Public */
        return {
            start: start,
            elapsedSeconds: elapsedSeconds
        }
    }());

    /*
    This function keeps all stats that are used by the game. Its main purpose is to
    make the program lighter by not reading stats from the DOM.
    Methods:
        addError - increases the number of errors by 1
        getNumErrors - returns the total number of errors
        calculateWPM - calculate gross and net WPM (nothing returned)
        getGrossWPM - return gross WPM
        getNetWPM - return net WPM
        calculateAccuracy - calculate accuracy (nothing returned)
        getAccuracy - return accuracy in %
        reset - resets all stats
    */
    var stats = (function() {
        var numErrors = 0;
        var grossWPM = 0;
        var netWPM = 0;
        var accuracy = 0;

        function addError() { numErrors++;}
        function getNumErrors() { return numErrors; }
        function calculateWPM() {
            var typedEntries = text.getPos();
            var elapsedMinutes = timer.elapsedSeconds() / 60;
            grossWPM = (typedEntries / 5) / elapsedMinutes;
            netWPM = grossWPM - (numErrors / elapsedMinutes);
        }
        function getGrossWPM() { return grossWPM;}
        function getNetWPM() { return netWPM; }
        function calculateAccuracy() { accuracy = 100 - (numErrors / text.getPos()) * 100; }
        function getAccuracy() { return accuracy; }
        function reset() {
            numErrors = 0;
            grossWPM = 0;
            netWPM = 0;
            accuracy = 0;
        }

        /* Public */
        return {
            addError: addError,
            getNumErrors: getNumErrors,
            calculateWPM: calculateWPM,
            getGrossWPM: getGrossWPM,
            getNetWPM: getNetWPM,
            calculateAccuracy: calculateAccuracy,
            getAccuracy: getAccuracy,
            reset: reset
        }
    }());

    /*
    This function expression handles the text that is used in the game and variables and function relating to it
    Methods:
        parseXmlDoc - this function parses the XML document and sets private variables
        nextPosition - this function moves the position/iterator one step forward
        getPos - return the current position of the iterator in the next
        getText- return the currently selected text
        getAuthor - return the author of the currently selected text
        getTitle - return the title of the currently selected title
        getWords - return the number of words in the currently selected text
        getCharacters - return the number of characters in the currently selected text
        getCharAtPos - return the character at the iterator position
     */
    var text = (function() {
        var text = [];
        var title;
        var author;
        var characters;
        var words;
        var position;

        // Parse the XML document and set private instance variables
        function parseXmlDoc(titleToSet) {
            // Get xml-document
            var xmlDoc = xmlDocument.getXmlDoc();

            // Set title
            title = titleToSet;

            // Get the index of text
            var idx = xmlDocument.find(titleToSet, 'title');

            // Get a nodeList of all authors and texts
            var authorAll = xmlDoc.getElementsByTagName('author');
            var textAll = xmlDoc.getElementsByTagName('text');

            // Get the author and text in the nodeList using the index
            author = authorAll[idx].childNodes[0].nodeValue;
            text = Array.from(textAll[idx].childNodes[0].nodeValue);

            // Calculate the number of characters and words in the text. Words are counted
            // by counting whitespaces.
            characters = text.length;
            words = 1; // the word counter starts with 1 since the last word won't be counted below
            for (var i = 0; i < text.length; i++)
                if (text[i] === ' ')
                    words++;

            // Set position
            resetPos();
        }

        // Move position in text(iterator) one step forward
        function nextPosition() {
            if(position < text.length - 1) {
                position++;
                return true;
            }
        }
        function getPos() { return position; }
        function getText() { return text; }
        function getAuthor() { return author; }
        function getTitle() { return title; }
        function getWords() { return words; }
        function getCharacters() { return characters; }
        function getCharAtPos() { return text[position]; }
        function resetPos() { position = -1; }

        /* Public */
        return {
            parseXmlDoc: parseXmlDoc,
            nextPosition: nextPosition,
            getPos: getPos,
            getText: getText,
            getAuthor: getAuthor,
            getTitle: getTitle,
            getWords: getWords,
            getCharacters: getCharacters,
            getCharAtPos: getCharAtPos,
            resetPos: resetPos
        }
    }());

    /*
    This function expression contains functions that manipulates and gets data from the DOM
     */
    var domManipulator = (function() {

        /*
        This function updates the text area with information from the text object. It should be called every time
        changes in the text has been made, like user input or newly selected text
        Methods:
            updateTextArea - updates the text area with data from the text object
            updateStatsArea - updates the stats area with information from the stats object
            markErrorChar - Mark the currently highlighted character as an error by adding a error-class to it
            getLastTypedCharacter - return the last typed character
            removePlaceholder - remove the placeholder statement in the input field
            addPlaceholder - add back the statement
            selectorsEnabledState - switches the selectors on(true) and off (false)
            inputFieldEnabledState - switches the input fields on(true) and off (false)
            getLanguage - returns the selected language
            populateTextSelector - adds all texts to the text selector
            showPlayButton - shows the play button
            showStopButton - shows the stop button
            filterTextSelector - filters out texts from the text selector and hides them
                Parameter:
                    language - texts of this language is not filtered out
         */
        function updateTextArea() {
            /* Reference to the DOM text area*/
            var textArea = document.getElementById('textArea');

            /* Get info from text object*/
            var textArr = text.getText();
            var pos = text.getPos();

            /* Text after the cursor/current position*/
            var textAfterCursor = textArr.slice(pos + 1, textArr.length).join(''); // String

            /* If game has not yet been started */
            if (pos === -1 ) {
                textArea.innerHTML = textAfterCursor;
                document.getElementById('textName').innerHTML = text.getTitle();
                document.getElementById('textAuthor').innerHTML = text.getAuthor() + ' (' + text.getWords() + ' words, ' + text.getCharacters() + ' characters)';
            }

            /* If game just started, cursor is in first position*/
            if (pos === 0) {
                textArea.innerHTML = '<span id="beforeCursor"></span><span id ="cursor">' + textArr[0] + '</span><span id="afterCursor">' + textAfterCursor + '</span>';
            }

            /* Game has been started and cursor has been moved*/
            if (pos > 0) {
                /* References to the three text areas; before, at and after cursor*/
                var beforeCursor = document.getElementById('beforeCursor');
                var cursor = document.getElementById('cursor');
                var afterCursor = document.getElementById('afterCursor');

                /* Get current text before cursor*/
                var textBeforeCursor = beforeCursor.innerHTML;

                /* Add character at cursor to text before cursor.*/
                textBeforeCursor += cursor.innerHTML;

                /* Add text before cursor to the DOM*/
                beforeCursor.innerHTML = textBeforeCursor;

                /* Add new character at cursor position*/
                cursor.innerHTML = textArr[pos];

                /* Add text after cursor */
                afterCursor.innerHTML = textAfterCursor;
            }
        }

        /*
        The function updates the statistics of the game on the web page
        */
        function updateStatsArea(){
            /* Show the stats on the web-page.*/
            document.getElementById('grossWPM').innerHTML = 'Gross WPM: ' + Math.round(stats.getGrossWPM());
            document.getElementById('netWPM').innerHTML = 'Net WPM: ' + Math.round(stats.getNetWPM());
            document.getElementById('accuracy').innerHTML = 'Accuracy: ' + Math.round(stats.getAccuracy()) + '%';
            document.getElementById('errors').innerHTML = 'Errors: ' + stats.getNumErrors();

        }

        /*
        This function is called when an error is typed by the player. It marks the error by putting th
        current character in a span element with the errorChar class
        */
        function markErrorChar() {
            /* Mark the currently highlighted character as an error by adding a error-class to it */
            var cursor = document.getElementById('cursor');
            var cursorOldContent = cursor.innerHTML;
            cursor.innerHTML = '<span class="errorChar">' + cursorOldContent + '</span>';
        }

        /*
        This function returns the last character inputted by the player
        */
        function getLastTypedCharacter() {
            /* Get the input field*/
            var input = document.getElementById('input');

            /* Return the last character of the input string*/
            return input.value.charAt(input.value.length - 1);
        }

        /*
        This function clears the placeholder in the input field
        */
        function removePlaceholder() {
            document.getElementById('input').setAttribute('placeholder', '');
        }

        /*
        This function adds a placeholder in the input field
        */
        function addPlaceholder() {
            document.getElementById('input').setAttribute('placeholder', 'Type here...');
        }

        /*
        This function enables/disables the selectors
        Parameter:
            true or false. True means enabled.
        */
        function selectorsEnabledState(state) {
            /* enable the text selector */
            document.getElementById('selectedText').disabled = !state;

            /* enable the ignore casing selector */
            document.getElementById('ignoreCasing').disabled = !state;

            /* Get a nodeTree with all elements with the name 'language'*/
            var langRadioButtons = document.getElementsByName('language');

            /* Iterate through the form nodeTree and enable each language radio button */
            for (var i = 0; i < langRadioButtons.length; i++) {
                langRadioButtons[i].disabled = !state;
            }
        }
        /*
        This function returns the currently selected language
        */
        function getLanguage() {
            /* Get a nodeTree with all elements with the name 'language'*/
            var lang = document.getElementsByName('language');

            /*
            Iterate through the form nodeTree . If node is checked,
            return its value. Since language is selected with radio
            buttons, only one language can be selected.
            */
            for (var i = 0; i < lang.length; i++)
                if (lang[i].checked)
                    return lang[i].value;
        }

        /*
        This function adds all texts to the text selector
        */
        function populateTextSelector() {
            // get the selector and remove its content
            var selector = document.getElementById('selectedText');
            selector.innerHTML = '';

            // Get a nodeTree with all titles
            var titles = xmlDocument.getXmlDoc().getElementsByTagName('title');

            // Iterate through the nodeTree. For each node, get the title
            // and add it to the selector
            for (var i = 0; i < titles.length; i++) {
                var title = titles[i].childNodes[0].nodeValue;
                selector.innerHTML += '<option value="'  + title + '" id="text' + i + '">' + title + '</option>';
            }
        }

        /*
        This function show the play button
         */
        function showPlayButton() {
            document.getElementById('stopButton').classList.add('hidden');
            document.getElementById('playButton').classList.remove('hidden');
        }

        /*
        This function show the stop button
        */
        function showStopButton() {
            document.getElementById('playButton').classList.add('hidden');
            document.getElementById('stopButton').classList.remove('hidden');
        }

        /*
        This function enables/disables the input field
         */
        function inputFieldEnabledState(state) {
            var inputField = document.getElementById('input');
            if(state) {
                inputField.disabled = false;
                inputField.focus();
            } else {
                inputField.value = "";
                inputField.disabled = true;
            }
        }

        /*
        This function filters the languages in the text selector
        Parameter:
            language - the language of the texts that is to be left in the text selector
         */
        function filterTextSelector(language){
            /* Array with indexes of all texts with given language*/
            var idxArray = xmlDocument.find(language, 'language');

            /* Count the total number of texts by any language*/
            var numTexts = xmlDocument.numTexts();

            /*
            Hide all texts with the wrong language from the text selector.
            The for-loop iterates through all texts. If the index of the text
            is found in the array containing indexes of texts with the selected language,
            un-hide it, else hide it.
            */
            for (var i = 0; i < numTexts; i++) {
                var text = document.getElementById('text' + i);

                if (idxArray.indexOf(i) !== -1) {
                    text.classList.remove('hidden');
                } else {
                    text.classList.add('hidden');
                }

                /* Set first text as selected to update the selected text in the text selector */
                /* Get selector */
                var selector = document.getElementById('selectedText');
                /*
                Iterate through all texts. When the first text that isn't hidden is discovered,
                select it and break the loop
                */
                for(var j = 0; j < selector.options.length; j++) {
                    if (!selector.options[j].classList.contains('hidden')) {
                        selector.selectedIndex = j;

                        /* Update the text area by simulating the text being selected */
                        eventHandlers.handleTextSelector(selector.options[j].innerHTML);

                        break;
                    }
                }
            }
        }

        /* Public */
        return {
            updateTextArea: updateTextArea,
            updateStatsArea: updateStatsArea,
            markErrorChar: markErrorChar,
            getLastTypedCharacter: getLastTypedCharacter,
            removePlaceholder: removePlaceholder,
            addPlaceholder: addPlaceholder,
            selectorsEnabledState: selectorsEnabledState,
            inputFieldEnabledState: inputFieldEnabledState,
            getLanguage: getLanguage,
            populateTextSelector: populateTextSelector,
            showPlayButton: showPlayButton,
            showStopButton: showStopButton,
            filterTextSelector: filterTextSelector
        }
    }());

    /*
    This function expression contains functions that responds to events
     Methods:
        readInput - handles the event thrown when the user inputs data in the input field of the game
        play - handles the event thrown when the user presses the play button
        stop - handles the event thrown when the user presses the stop button
        handleLanguageSelector - handles the event when the user changes language
        handleTextSelector - handles the event when the user chooses a text
            Parameter:
                title - title of the text that is to be selected
        initBeepSound - initializes the sound used when the players inputs a wrong character
     */
    var eventHandlers = (function () {
        // The beep sound that sounds when the user types an error
        var beep;

        /* Load beep sound using link in the DOM */
        function initBeepSound() {
            beep = document.getElementById('beep');
        }

        /*
            This function handles input to the input field
        */
        function readInput() {

            /* Get last typed character */
            var lastTypedChar = domManipulator.getLastTypedCharacter();

            /* If the last typed character is incorrect, register it as an error and update the stats */
            /*   if case should be ignored */
            if (document.getElementById('ignoreCasing').checked) {
                if (lastTypedChar.toLocaleLowerCase() !== text.getCharAtPos().toLocaleLowerCase()) {
                    stats.addError();
                    domManipulator.markErrorChar();

                    // Play the error sound
                    beep.play();
                }
            }
            /* if case shouldn't be ignored */
            else if (lastTypedChar !== text.getCharAtPos()) {
                stats.addError();
                domManipulator.markErrorChar();

                // Play an error sound
                beep.play();
            }

            // If the last typed character is a whitespace, clear the input field
            if (lastTypedChar === ' ') {
                document.getElementById('input').value='';
            }

            /* Move cursor*/
            text.nextPosition();

            /* Show changes to the text area*/
            domManipulator.updateTextArea();

            /* Update stats*/
            stats.calculateWPM();
            stats.calculateAccuracy();
            domManipulator.updateStatsArea();

            /* Add points to be drawn to the graph*/
            graph.addPoints(timer.elapsedSeconds() / 60, stats.getNetWPM());

            /* Draw graph*/
            graph.draw();
        }

        /*
            This function starts the game. It disables and enables fields and selectors and
            switches the play button with the stop button. It calls functions to reset the game.
        */
        function play() {
            /* Hide the play-button and show the stop button by changing the elements classes.*/
            domManipulator.showStopButton();

            /* Disable the selectors*/
            domManipulator.selectorsEnabledState(false);

            /* Activate the input field and give it focus*/
            domManipulator.inputFieldEnabledState(true);

            /* Reset the stats*/
            stats.reset();
            domManipulator.updateStatsArea();

            /* Reset the graph*/
            graph.reset();

            /* reset the text iterator */
            text.resetPos();

            /* reset the text area */
            domManipulator.updateTextArea();

            /* Move text iterator one step forward to position 0 */
            text.nextPosition();

            /* Update the text area to show the cursor*/
            domManipulator.updateTextArea();

            /* Start the timer*/
            timer.start();
        }

        /*
            This function stops the game, enables and disables fields and selectors and switches the stop button with
            the play button.
        */
        function stop() {
            /* Hide the stop button, show the play button */
            domManipulator.showPlayButton();

            /* Activate the selectors*/
            domManipulator.selectorsEnabledState(true);

            /* Deactivate the input field*/
            domManipulator.inputFieldEnabledState(false);
        }

        /*
            This function selects the language selected with the language selector radio buttons
        */
        function handleLanguageSelector() {
            /* Get the currently selected language*/
            var language = domManipulator.getLanguage();

            /* filter the text selector*/
            domManipulator.filterTextSelector(language);
        }

        /*
        This function calls functions when a text is selected in the text selector
         */
        function handleTextSelector(title) {
            text.parseXmlDoc(title);
            domManipulator.updateTextArea();
        }

        return {
            readInput: readInput,
            play: play,
            stop: stop,
            handleLanguageSelector: handleLanguageSelector,
            handleTextSelector: handleTextSelector,
            initBeepSound: initBeepSound
        }
    }());

    /*
        This function initializes objects and event listeners
     */
    function init() {
        /* Reset the canvas graph, which paints the graph background */
        graph.reset();

        /* Add event listeners */
        document.getElementById('input').addEventListener('input', function() { eventHandlers.readInput() }, false);
        document.getElementById('input').addEventListener('focus', function() { domManipulator.removePlaceholder() }, false);
        document.getElementById('input').addEventListener('blur', function() { domManipulator.addPlaceholder() }, false);
        document.getElementById('playButton').addEventListener('click', function() { eventHandlers.play() }, false);
        document.getElementById('stopButton').addEventListener('click', function() { eventHandlers.stop() }, false);

        /* Reset forms */
        document.getElementById('settings').reset();
        document.getElementById('textSelector').reset();
        document.getElementById('gameInput').reset();

        /* Make sure the input field is deactivated */
        document.getElementById('input').disabled = true;

        /* Load the xml document */
        xmlDocument.load();

        /* get the address to the beep sound */
        eventHandlers.initBeepSound();

    }

    return { init:init }

}());
/*
    Function to initialize the scripts for the html document
*/
window.addEventListener('load', function() { speedType.init() }, false);


