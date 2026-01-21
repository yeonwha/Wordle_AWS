import "./stylesheets/App.css";
import { useEffect, useState } from "react";
import GameOverPopup from "./GameOverPopup";

import { withAuthenticator } from '@aws-amplify/ui-react';
import { Amplify} from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { defaultStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

const authConfig = {
  Cognito: {
    userPoolId: 'us-east-1_j0RaLcbf2',
    userPoolClientId: '18qmj8fifl94igv4fqskkqei9c'
  }
};

cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);

Amplify.configure(
  {
    Auth: authConfig
  },
  { Auth: { 
      tokenProvider: cognitoUserPoolsTokenProvider 
    } 
  }
);

function App({ signOut, user }) {
  //Popup State item
  const [gameOverPopup, setGameOverPopup] = useState(true);
  const [result, setResult] = useState("Fail");
  const [dailyWord, setDailyWord] = useState();
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [history, setHistory] = useState([{"guesses":[], "playDate":"", "word":"","player":""}]);

  //Set State variables for Current Guesses.
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentGuessNum, setCurrentGuessNum] = useState(1);
  const [firstGuess, setFirstGuess] = useState("");
  const [secondGuess, setSecondGuess] = useState("");
  const [thirdGuess, setThirdGuess] = useState("");
  const [fourthGuess, setFourthGuess] = useState("");
  const [fifthGuess, setFifthGuess] = useState("");
  const [sixthGuess, setSixthGuess] = useState("");
  const [correctGuess, setCorrectGuess] = useState(false);

  const defaultGuessArray = [
    "neutral",
    "neutral",
    "neutral",
    "neutral",
    "neutral",
  ];
  //Set the current arrays for guesses css classes
  const [firstGuessArray, setFirstGuessArray] = useState(defaultGuessArray);
  const [secondGuessArray, setSecondGuessArray] = useState(defaultGuessArray);
  const [thirdGuessArray, setThirdGuessArray] = useState(defaultGuessArray);
  const [fourthGuessArray, setFourthGuessArray] = useState(defaultGuessArray);
  const [fifthGuessArray, setFifthGuessArray] = useState(defaultGuessArray);
  const [sixthGuessArray, setSixthGuessArray] = useState(defaultGuessArray);

  // When you hit enter iterate the current guess
  const handleKeyDown = async (event) => {
    // Check if enter has been hit and the message is exactly 5 characters long
    if (
      event.key === "Enter" &&
      currentGuess.length === 5 &&
      (await checkValid(currentGuess))
    ) {
      // Set the guess state to register correct, incorrect, and contains for CSS styling. Iterate over every set
      if (currentGuessNum === 1 && !correctGuess) {
        setFirstGuessArray(await checkGuess(firstGuess));
      } else if (currentGuessNum === 2 && !correctGuess) {
        setSecondGuessArray(await checkGuess(secondGuess));
      } else if (currentGuessNum === 3 && !correctGuess) {
        setThirdGuessArray(await checkGuess(thirdGuess));
      } else if (currentGuessNum === 4 && !correctGuess) {
        setFourthGuessArray(await checkGuess(fourthGuess));
      } else if (currentGuessNum === 5 && !correctGuess) {
        setFifthGuessArray(await checkGuess(fifthGuess));
      } else if (currentGuessNum === 6 && !correctGuess) {
        setSixthGuessArray(await checkGuess(sixthGuess));
      }
      //Increment guess count and reset the input
      setCurrentGuessNum(parseInt(currentGuessNum) + 1);
      setCurrentGuess("");
    }
  };

  // Check if the word is in the database
  async function checkValid(guess) {
    let session = await fetchAuthSession();
    let idToken = session.tokens.idToken;
    let jwt = idToken.toString();
    
    // -------------------------------------------------------------------------------------
    // Web Service Integration 2: Add call to isValidWord web service here and return true if 
    // it's valid word and false otherwise.
    // -------------------------------------------------------------------------------------
    
    // let guessedWord = `"${guess}"`;
    //console.log(`${guess} type: ` + typeof(guess));

    let url = new URL('https://b7ps1otttg.execute-api.us-east-1.amazonaws.com/test/isvalidword');
    let params = { word: guess };
    url.search = new URLSearchParams(params).toString();

    try {
        console.log("isvalidword fetch start");
        let checked = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          }
        });
        let response = await(checked.json());
        //console.log(`${response.result} is ` + typeof(response.result));
        console.log("isvalidword fetch finished");
        return response.result
    }
    catch (e) {
        console.log("checkValid() err " + e);
        alert(JSON.stringify(e));
    }
  }

  // Check if the word is the daily word
  async function checkGuess(guess) {
    let session = await fetchAuthSession();
    let idToken = session.tokens.idToken;
    let jwt = idToken.toString();
    // check if word is valid
    // Send guess to be checked by backend
    let ischecked = checkValid(guess);

    // Delete these two lines when you wire in the web service
    let results;
    //  //results.result = [];

    // -------------------------------------------------------------------------------------
    // Web Service Integration 3: Add call to checkWord web service here, passing in the 
    // daily word, together with the guess.
    // -------------------------------------------------------------------------------------
    
    if (ischecked){
      let url = new URL('https://b7ps1otttg.execute-api.us-east-1.amazonaws.com/test/checkword');
      let params = { 
        guess: guess, 
        word: dailyWord 
      };
      url.search = new URLSearchParams(params).toString();
      
      try {
        console.log("checkword fetch start");
        let checked = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          }
        });
        results = await(checked.json());
        //results.result = response.result
        console.log("checkword fetch finished");
         //response.result
      } catch (err) {
        console.log("checkGuess() err " + err);
      }
    }
    else {
      return;
    }

    // Check if there were 5 correct letters to see if the puzzle is solved
    let correctCount = 0;
    results.result.forEach((e) => {
      if (e === "correct") {
        correctCount++;
      }
    });
    if (correctCount === 5) {
      // If the guess is correct set every check to true.
      setResult("Solved");
      setCorrectGuess(true);
      setGameOverPopup(true);
      //Set Failure
    } else if (currentGuessNum === 6 && correctCount < 5) {
      setResult("Failed. Correct Word = " + dailyWord);
      setGameOverPopup(true);
    }
    console.log(results.result);
    return results.result;
  }

  // Get the daily word from API backend.
  const getDailyWord = async () => {
      let session = await fetchAuthSession();
      let idToken = session.tokens.idToken;
      let jwt = idToken.toString();

    // -------------------------------------------------------------------------------------
    // Web Service Integration 1: Add call to nextWord web service here. When you get the next 
    // word, call setDailyWord to initialize the application. For example 
    // setDailyWord(data.result)). setDailyWord is a react useState variable
    // -------------------------------------------------------------------------------------
    
    try{
      //console.log("fetch start");
      let response = await fetch('https://b7ps1otttg.execute-api.us-east-1.amazonaws.com/test/nextword',
      {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      
      let json = await response.json();
      //let body = json.body;
      //let json_body = JSON.parse(body);
      //let word = json_body.result
      //console.log(json.result);
      setDailyWord(json.result);
      //console.log("getDailyWord fetch finished, setDailyWord set")
    } catch (err) {
      console.log("getDailyWord error: " + err);
    }    
    // Delete the next line of code when you wire up the web service    
  };

  // Handle save game button press (To be wired up)
  const handleSave = async () => {
    let data = {
      playerName: currentPlayer,
      date: Date.now().toString(), // Add date here
      word: dailyWord,
      guesses: [
        firstGuess,
        secondGuess,
        thirdGuess,
        fourthGuess,
        fifthGuess,
        sixthGuess,
      ],
    };

    // -------------------------------------------------------------------------------------
    // Web Service Integration 4: Add call to savegameplay web service here, Passing in the 
    // JSON object for the game, play with your include the wording question, the player, play 
    // date, word and array of guesses.
    // -------------------------------------------------------------------------------------
    let session = await fetchAuthSession();
    let idToken = session.tokens.idToken;
    let jwt = idToken.toString();

    try {
      console.log("savegameplay fetch start");
      let response = await fetch('https://b7ps1otttg.execute-api.us-east-1.amazonaws.com/test/savegamehistory', 
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(data),
        }
      );
      
      //results.result = response.result
      console.log("savegameplay fetch finished");
        //response.result
    } catch (err) {
      console.log("handleSave() err " + err);
    }

    handleReset();
    setGameOverPopup(false);
  };

  // Handle reset game button press
  const handleReset = () => {
    //Reset Guess Count
    setCurrentGuessNum(1);
    setCorrectGuess(false);
    //Reset Guesses
    setFirstGuess("");
    setSecondGuess("");
    setThirdGuess("");
    setFourthGuess("");
    setFifthGuess("");
    setSixthGuess("");
    //Reset CSS Arrays
    setFirstGuessArray(defaultGuessArray);
    setSecondGuessArray(defaultGuessArray);
    setThirdGuessArray(defaultGuessArray);
    setFourthGuessArray(defaultGuessArray);
    setFifthGuessArray(defaultGuessArray);
    setSixthGuessArray(defaultGuessArray);
    //hide popup
    setGameOverPopup(false);
  };

  // Populate the guess form
  const handleChange = (e) => {
    if (currentGuessNum === 1 && !correctGuess) {
      setFirstGuess(e.target.value);
    } else if (currentGuessNum === 2 && !correctGuess) {
      setSecondGuess(e.target.value);
    } else if (currentGuessNum === 3 && !correctGuess) {
      setThirdGuess(e.target.value);
    } else if (currentGuessNum === 4 && !correctGuess) {
      setFourthGuess(e.target.value);
    } else if (currentGuessNum === 5 && !correctGuess) {
      setFifthGuess(e.target.value);
    } else if (currentGuessNum === 6 && !correctGuess) {
      setSixthGuess(e.target.value);
    }
    setCurrentGuess(e.target.value);
  };

  const handlePlayer = (e) => {
    setCurrentPlayer(e.target.value);
  };

  async function searchHistory() {
    let session = await fetchAuthSession();
    let idToken = session.tokens.idToken;
    let jwt = idToken.toString();

    // -------------------------------------------------------------------------------------
    // Web Service Integration 5: Add call to getgamehistory web service to retrieve the 
    // games played by the current user. Call setHistory to update the app's UI. 
    // setHistory is a react useState variable
    // -------------------------------------------------------------------------------------

    let url = new URL('https://b7ps1otttg.execute-api.us-east-1.amazonaws.com/test/getgamehistory');
    let params = { 
      playerName: currentPlayer
    };
    url.search = new URLSearchParams(params).toString();
    
    try {
      console.log("getgamehistroy fetch start");
      let response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      });
      let json = await response.json();
      let arr = [json];      

      console.log("arr: ");
      console.log(arr);
      setHistory(arr);
      // console.log("history: " + history);
      console.log("getgamehistroy fetch finished");
    } catch (err) {
      console.log("searchHistory() err " + err);
    }
  }
 
  useEffect(() => {
    getDailyWord();
  }, []);

  return (
    <div className="App">
      {dailyWord}
      <div className="play-area">
        <div id="play-cell" className={firstGuessArray[0]}>
          {firstGuess[0]}
        </div>
        <div id="play-cell" className={firstGuessArray[1]}>
          {firstGuess[1]}
        </div>
        <div id="play-cell" className={firstGuessArray[2]}>
          {firstGuess[2]}
        </div>
        <div id="play-cell" className={firstGuessArray[3]}>
          {firstGuess[3]}
        </div>
        <div id="play-cell" className={firstGuessArray[4]}>
          {firstGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={secondGuessArray[0]}>
          {secondGuess[0]}
        </div>
        <div id="play-cell" className={secondGuessArray[1]}>
          {secondGuess[1]}
        </div>
        <div id="play-cell" className={secondGuessArray[2]}>
          {secondGuess[2]}
        </div>
        <div id="play-cell" className={secondGuessArray[3]}>
          {secondGuess[3]}
        </div>
        <div id="play-cell" className={secondGuessArray[4]}>
          {secondGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={thirdGuessArray[0]}>
          {thirdGuess[0]}
        </div>
        <div id="play-cell" className={thirdGuessArray[1]}>
          {thirdGuess[1]}
        </div>
        <div id="play-cell" className={thirdGuessArray[2]}>
          {thirdGuess[2]}
        </div>
        <div id="play-cell" className={thirdGuessArray[3]}>
          {thirdGuess[3]}
        </div>
        <div id="play-cell" className={thirdGuessArray[4]}>
          {thirdGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={fourthGuessArray[0]}>
          {fourthGuess[0]}
        </div>
        <div id="play-cell" className={fourthGuessArray[1]}>
          {fourthGuess[1]}
        </div>
        <div id="play-cell" className={fourthGuessArray[2]}>
          {fourthGuess[2]}
        </div>
        <div id="play-cell" className={fourthGuessArray[3]}>
          {fourthGuess[3]}
        </div>
        <div id="play-cell" className={fourthGuessArray[4]}>
          {fourthGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={fifthGuessArray[0]}>
          {fifthGuess[0]}
        </div>
        <div id="play-cell" className={fifthGuessArray[1]}>
          {fifthGuess[1]}
        </div>
        <div id="play-cell" className={fifthGuessArray[2]}>
          {fifthGuess[2]}
        </div>
        <div id="play-cell" className={fifthGuessArray[3]}>
          {fifthGuess[3]}
        </div>
        <div id="play-cell" className={fifthGuessArray[4]}>
          {fifthGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={sixthGuessArray[0]}>
          {sixthGuess[0]}
        </div>
        <div id="play-cell" className={sixthGuessArray[1]}>
          {sixthGuess[1]}
        </div>
        <div id="play-cell" className={sixthGuessArray[2]}>
          {sixthGuess[2]}
        </div>
        <div id="play-cell" className={sixthGuessArray[3]}>
          {sixthGuess[3]}
        </div>
        <div id="play-cell" className={sixthGuessArray[4]}>
          {sixthGuess[4]}
        </div>
      </div>
      <div>
        <input
          type="text"
          maxLength="5"
          value={currentGuess}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {gameOverPopup && (
        <GameOverPopup
          gameOverPopup={gameOverPopup}
          currentGuessNum={currentGuessNum}
          result={result}
          handleSave={handleSave}
          handleReset={handleReset}
          currentPlayer={currentPlayer}
          handlePlayer={handlePlayer}
          history={history}
          searchHistory={searchHistory}
        />
      )}
       <button onClick={()=>signOut()}>logout</button>
    </div>
  );
}

export default withAuthenticator(App);
