/*
Quizzez Answer Hacker

Documentation

*Run in Dom console for this to work*

Run() - creates a button that you can use which highlights the correct answers
Run("s") - this is stealth mode, the button that highlights the correct answer is hidden inside the "mute music" Button.
DumpKey(GetSetData()) - Will download a text file of the answer key. Run this command under "quizzez.com/join/game" in order for it to work

Happy Hacking ;)

*/

let CurrentQuestionNum = ""
let LastRedemption
class Encoding {
    static encodeRaw(t, e, o = "quizizz.com") {
        let s = 0;
        s = e ? o.charCodeAt(0) : o.charCodeAt(0) + o.charCodeAt(o.length - 1);
        let r = [];
        for (let o = 0; o < t.length; o++) {
            let n = t[o].charCodeAt(0),
                c = e ? this.safeAdd(n, s) : this.addOffset(n, s, o, 2);
            r.push(String.fromCharCode(c))
        }
        return r.join("")
    }

    static decode(t, e = !1) {
        if (e) {
            let e = this.extractHeader(t);
            return this.decodeRaw(e, !0)
        } {
            let e = this.decode(this.extractHeader(t), !0),
                o = this.extractData(t);
            return this.decodeRaw(o, !1, e)
        }
    }

    static decodeRaw(t, e, o = "quizizz.com") {
        let s = this.extractVersion(t);
        let r = 0;
        r = e ? o.charCodeAt(0) : o.charCodeAt(0) + o.charCodeAt(o.length - 1),
            r = -r;
        let n = [];
        for (let o = 0; o < t.length; o++) {
            let c = t[o].charCodeAt(0),
                a = e ? this.safeAdd(c, r) : this.addOffset(c, r, o, s);
            n.push(String.fromCharCode(a))
        }
        return n.join("")
    }

    static addOffset(t, e, o, s) {
        return 2 === s ? this.verifyCharCode(t) ? this.safeAdd(t, o % 2 == 0 ? e : -e) : t : this.safeAdd(t, o % 2 == 0 ? e : -e)
    }

    static extractData(t) {
        let e = t.charCodeAt(t.length - 2) - 33;
        return t.slice(e, -2)
    }

    static extractHeader(t) {
        let e = t.charCodeAt(t.length - 2) - 33;
        return t.slice(0, e)
    }

    static extractVersion(t) {
        if ("string" == typeof t && t[t.length - 1]) {
            let e = parseInt(t[t.length - 1], 10);
            if (!isNaN(e))
                return e
        }
        return null
    }

    static safeAdd(t, e) {
        let o = t + e;
        return o > 65535 ? o - 65535 + 0 - 1 : o < 0 ? 65535 - (0 - o) + 1 : o
    }

    static verifyCharCode(t) {
        if ("number" == typeof t)
            return !(t >= 55296 && t <= 56319 || t >= 56320 && t <= 57343)
    }
}

function GetQuestionType() {
    if (document.getElementsByClassName("question-media")[0]) {
        if (document.getElementsByClassName("question-text")[0]) {
            return ("Both")
        } else {
            return ("Media")
        }
    } else {
        return ("Text")
    }
}

function GetSetData() {
    let URL = window.location.href,
        GameType = URL.slice(URL.search("gameType=") + 9, URL.length),
        prevConx = localStorage.getItem("previousContext"),
        parsedConx = JSON.parse(prevConx),
        encodedRoomHash = parsedConx.game.roomHash,
        roomHash = Encoding.decode(encodedRoomHash.split("-")[1]),
        data = {
            roomHash: roomHash,
            type: GameType
        };
    let xhttp = new XMLHttpRequest
    xhttp.open("POST", "https://game.quizizz.com/play-api/v3/getQuestions", false)
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(data))
    return JSON.parse(xhttp.responseText);

}

function Download(filename, text) {
    text = text.replace(/([^\r])\n/g, "$1\r\n")
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function DumpKey(Set) {
    var i = 1;
    var Dump = "";
    for (let v of Object.keys(Set.questions)) {
        v = Set.questions[v];
        Dump += (i + ". " + stripHtml(v.structure.query.text) +
            "\n" + stripHtml(GetAnswer(v)) + "\n\n");
        i++;
    }
    Download("Answer Key", Dump)
}

function StripSpaces(html) {
    return html.replace(/\s+/g, '')
}

function stripHtml(html) {
    var temporalDivElement = document.createElement("div");
    temporalDivElement.innerHTML = html;
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

function GetQuestion(Set) {
    var i = 0;
    for (let v of Object.keys(Set.questions)) {
        v = Set.questions[v]
        switch (GetQuestionType()) {
            case "Both":
                let BothSRC = document.getElementsByClassName("question-media")[0].children[0].src
                BothSRC = BothSRC.slice(0, BothSRC.search("/?w=") - 1)
                if (v.structure.query.media[0]) {
                    if (v.structure.query.media[0].url == BothSRC) {
                        let BothQuestion = document.getElementsByClassName("question-text")[0].children[0].children[0].innerHTML
                        if (BothQuestion == v.structure.query.text) {
                            return (v)
                        }
                    }
                }
                break
            case "Media":
                let CurrentSRC = document.getElementsByClassName("question-media")[0].children[0].src
                CurrentSRC = CurrentSRC.slice(0, CurrentSRC.search("/?w=") - 1)
                if (v.structure.query.media[0]) {
                    if (v.structure.query.media[0].url == CurrentSRC) {
                        return (v)
                    }
                }
                break
            case "Text":
                let ToSearchA = StripSpaces(stripHtml(document.getElementsByClassName("question-text")[0].children[0].children[0].innerHTML))
                let ToSearchB = StripSpaces(stripHtml(v.structure.query.text))

                if (ToSearchA == ToSearchB) {
                    return (v)

                }
                break
        }
    }
    return 0;
}

function GetAnswer(Question) {
    switch (Question.structure.kind) {
        case "BLANK":
            // Text Response, we have no need for image detection in answers
            let ToRespond = []
            for (let i = 0; i < Question.structure.options.length; i++) {
                ToRespond.push(Question.structure.options[i].text)
            }
            return ToRespond;
        case "MSQ":
            // Multiple Choice
            let Answers = Encoding.decode(Question.structure.answer)

            Answers = JSON.parse(Answers)
            let TextArray = []
            for (let i = 0; i < Answers.length; i++) {
                if (Answers[i].text == "") {
                    TextArray.push(Question.structure.options[Answers[i]].media[0].url)
                } else {
                    TextArray.push(Question.structure.options[Answers[i]].text)
                }
            }
            return TextArray;
        case "MCQ":
            // Single Choice
            let AnswerNum = Encoding.decode(Question.structure.answer)
            let Answer = Question.structure.options[AnswerNum].text
            if (Answer == "") {
                Answer = Question.structure.options[AnswerNum].media[0].url
            }

            return Answer;
    }
}

function GetHackedAnswer() {
    let NewNum = document.getElementsByClassName("current-question")[0]
    let RedemptionQues = document.getElementsByClassName("redemption-marker")[0]
    Set = GetSetData()
    if (NewNum) {
        if (NewNum.innerHTML != CurrentQuestionNum) {
            if (document.getElementsByClassName("typed-option-input")[0]) {
                let Question = GetQuestion(Set)
                if (Question == "Error: No question found") {
                    alert("Failed to find question! This is a weird issue I don't understand, you will just have to answer this question legit for now. (error line 215)")
                } else {
                    let Answer = GetAnswer(Question)
                    if (Array.isArray(Answer)) {
                        let ToShow = ""
                        for (let x = 0; x < Answer.length; x++) {
                            if (ToShow == "") {
                                ToShow = Answer[x]
                            } else {
                                ToShow = ToShow + " | " + Answer[x]
                            }
                        }
                        let ToShowNew = "Press Ctrl+C to copy (Answers are seperated by ' | ')"
                        prompt(ToShowNew, ToShow)
                    } else {
                        let NewAnswer = "Press Ctrl+C to copy."
                        prompt(NewAnswer, Answer);
                    }
                }
            } else {
                let Choices = document.getElementsByClassName("options-container")[0].children[0].children
                for (let i = 0; i < Choices.length; i++) {
                    if (!Choices[i].classList.contains("emoji")) {
                        var Choice = Choices[i].children[0].children[0].children[0].children[0]
                        let Question = GetQuestion(Set)
                        if (Question === "Error: No question found") {
                            alert("Failed to find question!, you will just have to answer this question legit for now.(line 243)")
                        } else {
                            let Answer = GetAnswer(Question)
                            if (Array.isArray(Answer)) {
                                // We are on a question with multiple answers
                                for (let x = 0; x < Answer.length; x++) {
                                    if (Choice.innerHTML == Answer[x]) {
                                        Choices[i].children[0].children[0].style.borderColor = "#fff"
                                        Choices[i].children[0].children[0].style.backgroundColor = "#62c370"
                                    }
                                }
                            } else {
                                if (StripSpaces(stripHtml(Choice.innerHTML)) == StripSpaces(stripHtml(Answer))) {
                                    Choices[i].children[0].children[0].style.borderColor = "#fff"
                                    Choices[i].children[0].children[0].style.backgroundColor = "#62c370"
                                } else if (Choice.style.backgroundImage.slice(5, Choice.style.backgroundImage.length - 2).slice(0, Choice.style.backgroundImage.slice(5, Choice.style.backgroundImage.length - 2).search("/?w=") - 1) == GetAnswer(GetQuestion(Set))) {
                                    Choices[i].children[0].children[0].style.borderColor = "#fff"
                                    Choices[i].children[0].children[0].style.backgroundColor = "#62c370"
                                }
                            }
                        }
                    }
                }
            }
            CurrentQuestionNum = NewNum.innerHTML
        }
    } else if (RedemptionQues) {
        if (LastRedemption != GetQuestion(Set)) {
            let Choices = document.getElementsByClassName("options-container")[0].children[0].children
            for (let i = 0; i < Choices.length; i++) {
                if (!Choices[i].classList.contains("emoji")) {
                    let Choice = Choices[i].children[0].children[0].children[0].children[0]
                    if (Choice.innerHTML == GetAnswer(GetQuestion(Set))) {
                        Choice.innerHTML = "<correct-answer-x3Ca8B><u>" + Choice.innerHTML + "</u></correct-answer-x3Ca8B>"
                    }
                }
            }
            LastRedemption = GetQuestion(Set)
        }
    }


}

function InjectHTML() {
    document.getElementsByClassName('tool-bar')[0].innerHTML += `
  <div id="hackButton" style="
    display: flex;
    flex-direction: column;
    padding-top: 16px;
    width: 88px;
    align-items: center;
    transition: opacity .1s ease-in;
    -webkit-transition: opacity .1s ease-in;
    ">
    <button id="cbutton" style="
      width: 56px;
      height: 44px;
      border: none;
      cursor: pointer;
      background: linear-gradient(.356turn,#fb4d5e,#fa4c87);
      border-radius: 20px;"
      onclick=" GetHackedAnswer();"
      type="button" name="button">
        <svg width="25px" height="25px" viewBox="0 0 16 16" class="bi bi-bullseye" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10zm0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
          <path fill-rule="evenodd" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        </svg>
    </button>
  </div>
`;
}

function HijackMuteButton() {
    document.getElementsByClassName('music-mute-btn control-center-btn')[0].setAttribute("onclick", "GetHackedAnswer();")
}

function Run(Mode) {
    if (Mode != "s") {
        var ButtonEnumerator = setInterval(function() {
            if (document.getElementsByClassName("tool-bar")[0]) {
                if (!document.getElementById("hackButton")) {
                    document.head.insertAdjacentHTML('beforeend', `<style type="text/css">
              correct-answer-x3Ca8B {
                color: #fff !important;
              }
              #hackButton:hover {
                opacity: 0.79;
              }
              </style>`);
                    InjectHTML()
                }
            }
        }, 200);
    } else {
        var ButtonEnumerator = setInterval(function() {
            if (document.getElementsByClassName('music-mute-btn control-center-btn')[0]) {
                document.head.insertAdjacentHTML('beforeend', `<style type="text/css">
            correct-answer-x3Ca8B {
              color: #fff !important;
            }
            #hackButton:hover {
              opacity: 0.79;
            }
            </style>`);
                HijackMuteButton()
            }
        }, 200);
    }
}

Run("s")
