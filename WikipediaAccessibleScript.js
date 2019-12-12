// ==UserScript==
// @name         Wikipedia Accesible Script
// @updateURL    https://raw.githubusercontent.com/cgmora12/Wikipedia-Accessible/master/WikipediaAccessibleScript.js
// @downloadURL  https://raw.githubusercontent.com/cgmora12/Wikipedia-Accessible/master/WikipediaAccessibleScript.js
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Wikipedia Accesible Script (WAS)
// @author       You
// @match        https://es.wikipedia.org/*
// @match        https://es.m.wikipedia.org/*
// @match        https://*.wikipedia.org/*
// @grant        none
// @require http://code.jquery.com/jquery-3.3.1.slim.min.js
// @require http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==


// Global variables
const SpeechRecognition =
  window.webkitSpeechRecognition || window.SpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
const recognition = new SpeechRecognition()
var headlines
var languageCodeSyntesis = "en"
var languageCodeCommands = "en"

var increaseFontSizeCommand = "increase font size"
var decreaseFontSizeCommand = "decrease font size"
var stopListeningCommand = "stop listening"
var readCommand = "read"

var commands = [increaseFontSizeCommand, decreaseFontSizeCommand, stopListeningCommand, readCommand]

var changeCommand = "change command"
var cancelCommand = "cancel"
var changeCommandQuestion = "which command"
var newCommandQuestion = "which is the new command"
var changeCommandInProcess1 = false;
var changeCommandInProcess2 = false;
var newCommandString = "";


// Main method
$(document).ready(function() {
    createWebAugmentedMenu();
    addAugmentationOperations();
});


// Main menu
var divMenu;
function createWebAugmentedMenu(){

    var link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(link1)
    var link2 = document.createElement('link');
    link1.rel = 'stylesheet';
    link2.href= 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'
    document.head.appendChild(link2)


    divMenu = document.createElement("div");
    divMenu.id = "menu-webaugmentation";
    divMenu.style = "position: absolute; left: 2%; top: 2%; z-index: 100"
    var menuLinkDiv = document.createElement("div");
    var menuLink = document.createElement("a");
    menuLink.href = "javascript:void(0);";
    menuLink.className = "icon";
    menuLink.addEventListener("click", toggleMenu)
    var menuIcon = document.createElement("i");
    menuIcon.className = "fa fa-bars";
    menuLink.appendChild(menuIcon);
    menuLinkDiv.appendChild(menuLink);
    divMenu.appendChild(menuLinkDiv);

    var divButtons = document.createElement('div')
    divButtons.id = "foldingMenu"
    divButtons.style = "padding: 10px; border: 2px solid black; display: none; background-color: white"
    var a1 = document.createElement('a');
    //a1.href = '';
    a1.addEventListener("click", function(){
        changeFontSize('+');
    }, false);
    a1.text = '+ Aa';
    divButtons.appendChild(a1);
    divButtons.appendChild(document.createElement('br'));
    var a2 = document.createElement('a');
    //a2.href = '';
    a2.addEventListener("click", function(){
        changeFontSize('-');
    }, false);
    a2.text = '- Aa';
    divButtons.appendChild(a2);
    divButtons.appendChild(document.createElement('br'));
    var a3 = document.createElement('a');
    //a3.href = '';
    a3.addEventListener("click", goToVideos);
    a3.text = 'Videos';
    divButtons.appendChild(a3);
    var inputVideos = document.createElement('input');
    inputVideos.type = 'checkbox';
    inputVideos.id = 'youtubeVideosInput';
    inputVideos.value = 'youtubeVideosInput';
    inputVideos.checked = true;
    inputVideos.addEventListener("change", toggleYoutubeVideos, false);
    divButtons.appendChild(inputVideos);
    divButtons.appendChild(document.createElement('br'));
    var a4 = document.createElement('a');
    //a4.href = '';
    a4.addEventListener("click", function(){
        toggleMenu();
        closeCommandsMenu();
        toggleLanguageMenu();
    }, false);
    a4.text = 'Language';
    divButtons.appendChild(a4);
    divButtons.appendChild(document.createElement('br'));
    var a5 = document.createElement('a');
    //a5.href = '';
    a5.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        toggleCommandsMenu();
    }, false);
    a5.text = 'Voice commands';
    divButtons.appendChild(a5);

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 10%; top: 20%; z-index: 100;"
    i.addEventListener("click", function(){
        closeMenu();
    }, false);
    divButtons.appendChild(i);

    menuLinkDiv.appendChild(divButtons);
    document.body.appendChild(divMenu);

    changeLanguageMenu();
    commandsMenu();
}

function toggleMenu(){
  var x = document.getElementById("foldingMenu");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
  closeLanguageMenu();
  closeCommandsMenu();
}
function closeMenu(){
  var x = document.getElementById("foldingMenu");
  x.style.display = "none";
}


// Language management
function changeLanguageMenu(){

    try {
        var url = window.location.href;
        var urlLanguage = url.split("https://")[1].split(".")[0]
        changePredefinedVoiceLanguage(urlLanguage)
    }
    catch(error) {
        console.error(error);
    }

    var divLanguageMenu = document.createElement("div")
    divLanguageMenu.id = "menu-language";
    divLanguageMenu.style = "position: absolute; left: 5%; top: 5%; z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 1%; z-index: 100;"
    i.addEventListener("click", function(){
        closeLanguageMenu();
    }, false);
    divLanguageMenu.appendChild(i);

    var languages = document.getElementsByClassName("interlanguage-link");
    for(var languagesIndex = 0; languagesIndex < languages.length; languagesIndex++){
        if(window.getComputedStyle(languages[languagesIndex]).display === "list-item" &&
          window.getComputedStyle(languages[languagesIndex]).display !== "none"){
            var a1 = document.createElement('a');
            a1.href = languages[languagesIndex].firstElementChild.href;
            a1.text = languages[languagesIndex].firstElementChild.text;
            divLanguageMenu.appendChild(a1);
            divLanguageMenu.appendChild(document.createElement('br'));
            //console.log("language available: " + languages[languagesIndex].firstElementChild.text);
        }
    }
    document.body.appendChild(divLanguageMenu);
}

function changePredefinedVoiceLanguage(urlLanguage){
    languageCodeSyntesis = urlLanguage
    /*switch(urlLanguage){
        case "es": languageCodeSyntesis = "es"
    }*/
}

function toggleLanguageMenu(){
  var x = document.getElementById("menu-language");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function closeLanguageMenu(){
  var x = document.getElementById("menu-language");
  x.style.display = "none";
}


// Voice management
function commandsMenu(){
    var divCommandsMenu = document.createElement("div")
    divCommandsMenu.id = "menu-commands";
    divCommandsMenu.style = "position: absolute; left: 5%; top: 5%; z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 1%; z-index: 100;"
    i.addEventListener("click", function(){
        closeCommandsMenu();
    }, false);
    divCommandsMenu.appendChild(i);

    var a1 = document.createElement('a');
    a1.text = '"' + readCommand + '" command ';
    a1.addEventListener("click", function(){
        var result = prompt("New command value for " + readCommand +  " command", readCommand);
        readCommand = result;
        console.log(result);
    }, false);
    divCommandsMenu.appendChild(a1);
    var a1i = document.createElement('i');
    a1i.className = 'fa fa-edit'
    a1.appendChild(a1i);
    divCommandsMenu.appendChild(document.createElement('br'));
    var a2 = document.createElement('a');
    a2.text = '"' + increaseFontSizeCommand + '" command ';
    a2.addEventListener("click", function(){
        var result = prompt("New command value for " + increaseFontSizeCommand +  " command", increaseFontSizeCommand);
        increaseFontSizeCommand = result;
        console.log(result);
    }, false);
    divCommandsMenu.appendChild(a2);
    var a2i = document.createElement('i');
    a2i.className = 'fa fa-edit'
    a2.appendChild(a2i);
    divCommandsMenu.appendChild(document.createElement('br'));
    var a3 = document.createElement('a');
    a3.text = '"' + decreaseFontSizeCommand + '" command ';
    a3.addEventListener("click", function(){
        var result = prompt("New command value for " + decreaseFontSizeCommand +  " command", decreaseFontSizeCommand);
        decreaseFontSizeCommand = result;
        console.log(result);
    }, false);
    divCommandsMenu.appendChild(a3);
    var a3i = document.createElement('i');
    a3i.className = 'fa fa-edit'
    a3.appendChild(a3i);
    divCommandsMenu.appendChild(document.createElement('br'));
    var a4 = document.createElement('a');
    a4.text = '"' + stopListeningCommand + '" command ';
    a4.addEventListener("click", function(){
        var result = prompt("New command value for " + stopListeningCommand +  " command", stopListeningCommand);
        stopListeningCommand = result;
        console.log(result);
    }, false);
    divCommandsMenu.appendChild(a4);
    var a4i = document.createElement('i');
    a4i.className = 'fa fa-edit'
    a4.appendChild(a4i);
    divCommandsMenu.appendChild(document.createElement('br'));
    document.body.appendChild(divCommandsMenu);
}

function toggleCommandsMenu(){
  var x = document.getElementById("menu-commands");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function closeCommandsMenu(){
  var x = document.getElementById("menu-commands");
  x.style.display = "none";
}


// Operations
function addAugmentationOperations(){
    focusInfo();
    textToAudio();
    audioToText();
    //textSize();
    youtubeVideos();
    wikipediaLinks();
    breadCrumb();
}


// Focus info (delete unnecessary items)
function focusInfo(){
    //Hide instead of remove

    var content = document.getElementById("content");
    content.insertBefore(document.createElement("br"), content.childNodes[0]);
    $('#mw-page-base').remove()
    $('#mw-head-base').remove()
    $('#mw-navigation').remove()
    $('#content').removeClass('mw-body')
    $("#content").css({"padding":"1em"})
    $("#siteNotice").remove()
    $(".noprint").remove()
    $("#toc").remove()
    $(".mw-editsection").remove()
    $("#catlinks").remove()
    $(".mw-authority-control").remove()
    $(".authority-control").remove()
    $(".hatnote").remove()
    $(".listaref").remove()
    $(".reflist").remove()
    $(".references").remove()
    var references = document.getElementById("References")
    if(references){references.parentElement.remove()}
    var referencias = document.getElementById("Referencias")
    if(referencias){referencias.parentElement.remove()}
    $("#footer").remove()
    $(".mw-redirectedfrom").remove()
    $(".reference").remove()
    $(".metadata").remove()
    $(".navbox").remove()
    var notes = document.getElementById("Notes")
    if(notes){notes.parentElement.remove()}
    var sources = document.getElementById("Sources")
    if(sources){
        sources = sources.parentElement.nextElementSibling
        while(sources != null && sources.tagName != "H2"){
            var sourcesAux = sources.nexElementSibling
            sources.remove()
            sources = sourcesAux
        }
        document.getElementById("Sources").parentElement.remove()
    }
    var seeAlso = document.getElementById("See_also")
    if(seeAlso){
        seeAlso = seeAlso.parentElement.nextElementSibling
        while(seeAlso != null && seeAlso.tagName != "H2"){
            var seeAlsoAux = seeAlso.nextElementSibling
            seeAlso.remove()
            seeAlso = seeAlsoAux
        }
        document.getElementById("See_also").parentElement.remove()
    }
    var externalLinks = document.getElementById("External_links")
    if(externalLinks){
        externalLinks = externalLinks.parentElement.nextElementSibling
        while(externalLinks != null && externalLinks.tagName != "H2"){
            var externalLinksAux = externalLinks.nextElementSibling
            externalLinks.remove()
            externalLinks = externalLinksAux
        }
        document.getElementById("External_links").parentElement.remove()
    }

    // Collapsible items
    /*var link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = '/w/load.php?lang=en&modules=ext.cite.styles%7Cmediawiki.hlist%7Cmediawiki.ui.button%2Cicon%7Cmobile.init.styles%7Cskins.minerva.base.styles%7Cskins.minerva.content.styles%7Cskins.minerva.content.styles.images%7Cskins.minerva.icons.images%2Cwikimedia&only=styles&skin=minerva';
    document.head.appendChild(link1)

    headlines = document.getElementsByClassName("mw-headline")

    for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex++){
        headlines[headlineIndex].setAttribute("class","section-heading collapsible-heading open-block")
        headlines[headlineIndex].setAttribute("tabindex","0")
        headlines[headlineIndex].setAttribute("aria-haspopup","true")
        headlines[headlineIndex].setAttribute("aria-controls","scontent-collapsible-block-0")
        headlines[headlineIndex].innerHTML = "<div class=\"mw-ui-icon mw-ui-icon-mf-expand mw-ui-icon-element mw-ui-icon-small  indicator mw-ui-icon-flush-left\"></div>" + headlines[headlineIndex].innerHTML
    }*/

}


// Speech recognition
function audioToText(){
    headlines = document.getElementsByClassName("mw-headline")

    var commandsGrammar = [ 'increase', 'magnify', 'read', 'play', 'font', 'size', 'decrease', 'reduce', 'stop', 'listening'];
    var grammar = '#JSGF V1.0; grammar commands; public <command> = ' + commandsGrammar.join(' | ') + ' ;';
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = languageCodeCommands;
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.start();

    recognition.onresult = event => {
        const speechToText = event.results[event.results.length -1][0].transcript;
        console.log(speechToText);
        if(!changeCommandInProcess1 && !changeCommandInProcess2){
            if(speechToText.includes(increaseFontSizeCommand)){
                changeFontSize('+');
            }
            else if(speechToText.includes(decreaseFontSizeCommand)){
                changeFontSize('-');
            }
            else if(speechToText.includes(readCommand)){
                for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex ++){
                    if(speechToText.includes(readCommand + " " + headlines[headlineIndex].textContent.toLowerCase())){
                        var readContent = ""
                        var parent = headlines[headlineIndex].parentElement
                        while(parent.nextElementSibling.tagName != "H2"){
                            parent = parent.nextElementSibling
                            //console.log(parent.innerText)
                            readContent += parent.innerText
                        }
                        Read(readContent);
                        break;
                    }
                }
            }
            else if(speechToText.includes(changeCommand)){
                console.log("changeCommandInProcess = true")
                changeCommandInProcess1 = true;
                Read(changeCommandQuestion + "?");
            }
            else if(speechToText.includes(stopListeningCommand)){
                recognition.abort();
            }
        } else {
            if(changeCommandInProcess1){
                //Command change in process
                if(!speechToText.includes(changeCommandQuestion) && !speechToText.includes(newCommandQuestion)){
                    if(commands.includes(speechToText.toLowerCase())){
                        Read(newCommandQuestion + "?");
                        newCommandString = speechToText.toLowerCase();
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = true;
                    } else if(speechToText.toLowerCase() == cancelCommand) {
                        console.log("Cancel change of command")
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = false;
                    } else {
                        Read(speechToText + " is not an existing command. Try again.");
                    }
                }
            } else if(changeCommandInProcess2){
                //Command change in process
                if(!speechToText.includes(changeCommandQuestion) && !speechToText.includes(newCommandQuestion)){
                    if(speechToText.toLowerCase() == cancelCommand) {
                        console.log("Cancel change of command")
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = false;
                    } else {
                        Read(speechToText + " is the new command");
                        eval(camelize(newCommandString) + "Command = '" + speechToText.toLowerCase() + "'");
                        //console.log("new variable value " + eval(camelize(newCommandString) + "Command"))
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = false;
                        commands.push(speechToText.toLowerCase());
                        commands = commands.filter(function(item) {
                            return item !== newCommandString
                        })
                    }
                }
            }
        }
    }
}
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}


// Text to Audio
function textToAudio(){
    $('p, ul').each(function() {
        if($(this).parent().attr('role') != 'navigation'){
            var button = document.createElement('button');
            button.innerHTML = "&#9658;";
            button.value = $(this).prop('innerText');
            button.style.fontSize = "18px";
            button.addEventListener('click', function(){
                Read($(this).prop('value'));
            });
            $(this).append(button);
        }
    });

    var cancelfooter = document.createElement('div');
    cancelfooter.id = "cancel";
    var buttonStop = document.createElement('button');
    buttonStop.innerText = "Pause";
    buttonStop.addEventListener('click', stopReading);
    buttonStop.style.height = "50px";
    buttonStop.style.fontSize = "25px";
    cancelfooter.appendChild(buttonStop);
    document.body.appendChild(cancelfooter);
    $('#cancel').css({
        'position': 'fixed',
        'left': '0',
        'bottom': '0',
        'width': '100%',
        'background-color': 'black',
        'color': 'white',
        'text-align': 'center',
        'visibility': 'hidden',
    });
}

var timeoutResumeInfinity;

function Read(message){
    //console.log("Read function: " + message)
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    var reader = new SpeechSynthesisUtterance(message);
    reader.lang = languageCodeSyntesis;
    reader.onstart = function(event) {
        recognition.abort();
        resumeInfinity();
    };
    reader.onend = function(event) {
        clearTimeout(timeoutResumeInfinity);
        $('#cancel').css('visibility', 'hidden');
        recognition.start();
    };
    window.speechSynthesis.speak(reader);
    $('#cancel').css('visibility', 'visible');
}

function resumeInfinity() {
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
    timeoutResumeInfinity = setTimeout(resumeInfinity, 10000);
    $('#cancel').css('visibility', 'visible');
}

function stopReading(){
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    $('#cancel').css('visibility', 'hidden');
}


// Font size
function textSize(){
    var plusButton = document.createElement("Button");
    plusButton.innerHTML = "Font size +";
    //plusButton.style = "bottom:0;right:0;position:fixed;z-index: 9999"
    divMenu.appendChild(plusButton);
    plusButton.addEventListener('click', function(){
        changeFontSize('+');
    });
    var minusbutton = document.createElement("Button");
    minusbutton.innerHTML = "Font size -";
    //minusbutton.style = "bottom:20px;right:0;position:fixed;z-index: 9999"
    divMenu.appendChild(minusbutton);
    minusbutton.addEventListener('click', function(){
        changeFontSize('-');
    });
}

function changeFontSize(changer){

    var scroll = window.scrollY;
    var totalScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight,
                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
    console.log("scroll: " + scroll + " total: " + totalScroll);

    //var bodyContent = document.getElementsByClassName('mw-body-content');
    //document.body.style.fontSize = (window.getComputedStyle(document.body, null).getPropertyValue('font-size') + 1) + 'px';
    var bodyContent = document.getElementsByTagName('div');
    if(changer === '+'){
        for(var i = 0; i < bodyContent.length; i++) {
            var styleI = window.getComputedStyle(bodyContent[i], null).getPropertyValue('font-size');
            var fontSizeI = parseFloat(styleI);
            bodyContent[i].style.fontSize = (fontSizeI + 2) + 'px';
        }
    }
    else if(changer === '-'){
        for(var j = 0; j < bodyContent.length; j++) {
            var styleJ = window.getComputedStyle(bodyContent[j], null).getPropertyValue('font-size');
            var fontSizeJ = parseFloat(styleJ);
            bodyContent[j].style.fontSize = (fontSizeJ - 2) + 'px';
        }
    }

    var currentTotalScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight,
                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
    var currentScroll = (scroll * currentTotalScroll) / totalScroll;
    console.log("currentScroll: " + currentScroll + " currentTotalScroll: " + currentTotalScroll);
    window.scrollTo(0, currentScroll);
}


// Youtube videos
function youtubeVideos(){
    getRequest($("#firstHeading").prop('innerText'));
}

function getRequest(searchTerm) {
    var url = 'https://www.googleapis.com/youtube/v3/search';
    var params = {
        part: 'snippet',
        key: 'AIzaSyBB9Vs9M1WcozRTjf9rGBU-M-HEpGYGXv8',
        type: 'video',
        maxResults: 6,
        q: searchTerm
    };

    $.getJSON(url, params, showResults);
}

function showResults(results) {
    var html = "";
    var entries = results.items;
    var content = document.createElement('div');

    $.each(entries, function (index, value) {
        var videoId = value.id.videoId;
        var vid = '<iframe width="380" height="200" src="https://www.youtube.com/embed/'+videoId
            +'" frameborder="1" margin="5px" padding="5px" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        content.innerHTML += vid;
    });

    $('.mw-parser-output').append("<div id='youtubeVideos' style='display: block'><br><h2><span class='mw-headline' id='Youtube_videos'>Youtube videos</span></h2></div>")
    $('#youtubeVideos').append(content)

}

function goToVideos(){
    toggleMenu();
    $(window).scrollTop($('#youtubeVideos').offset().top);
}

function toggleYoutubeVideos(){
  var x = document.getElementById("youtubeVideos");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

// Wikipedia Links
function wikipediaLinks(){
    //Index
    $('.new').each(function() {
        var word = $(this).prop('href');
        word = word.split("title=")[1];
        word = word.split("&")[0];
        var auxlink = "https://en.wikipedia.org/wiki/"+word;
        $(this).prop('href', auxlink);
    });
}


// Bread Crumb (History)
function breadCrumb(){
    var i
    var breadcrumb = document.createElement('div');
    breadcrumb.id = "breadcrumb";

    if(localStorage.getItem("i") != null){
        i = parseInt(localStorage.getItem("i"))+1;
        localStorage.setItem("i", i);
    }else{
        i = 0;
        localStorage.setItem("i", i);
    }
    localStorage.setItem(i.toString(), location.href);
    localStorage.setItem("name"+i.toString(), document.getElementById("firstHeading").innerText);
    if(i == 6){
        localStorage.setItem("0", localStorage.getItem("1"));
        localStorage.setItem("name0", localStorage.getItem("name1"));
        localStorage.setItem("1", localStorage.getItem("2"));
        localStorage.setItem("name1", localStorage.getItem("name2"));
        localStorage.setItem("2", localStorage.getItem("3"));
        localStorage.setItem("name2", localStorage.getItem("name3"));
        localStorage.setItem("3", localStorage.getItem("4"));
        localStorage.setItem("name3", localStorage.getItem("name4"));
        localStorage.setItem("4", localStorage.getItem("5"));
        localStorage.setItem("name4", localStorage.getItem("name5"));
        localStorage.setItem("5", localStorage.getItem("6"));
        localStorage.setItem("name5", localStorage.getItem("name6"));
        i = 5;
        localStorage.setItem("i", "5");
    }
    document.body.appendChild(breadcrumb);
    $('#breadcrumb').css({
        'position': 'absolute',
        'height': '50px',
        'left': '15%',
        'top': '0',
        'width': '100%',
        'padding': '10px',
        //'background-color': '#FFFFFF',
        'vertical-align': 'bottom',
        'visibility': 'visible',
    });
    var item = ""
    for(var x=0;x<i;x++){
        if(item != localStorage.getItem("name"+x.toString())){
            var link = document.createElement("a");
            link.href = localStorage.getItem(x.toString());
            link.innerText=localStorage.getItem("name"+x.toString());
            link.className="linkBread";
            $('#breadcrumb').append(link);
            document.getElementById("breadcrumb").innerHTML += " > ";
            item = localStorage.getItem("name"+x.toString());
        }
    }
    $('.linkBread').each(function(){
        $(this).css({
            'padding':'3px',
        });
    });
}
