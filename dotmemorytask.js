// Dot Memory and Sentence Judgement Dual Task 
// Based on De Neys & Schaeken (2007), Dieussaert et al. (2011) and Marty & Chemla (2013)
// This code uses jsPsych to implement a dot pattern memory task with sentence judgement

// Define the practice dot patterns
const practicePatterns = [
  { type: 'practice', dots: [1, 5, 9] },
  { type: 'practice', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { type: 'practice', dots: [1, 4, 5, 6, 9] }
];

// Define the practice sentences
const practiceSentences = [
  { text: "All circles are square", type: "practice" },
  { text: "Some pens are blue", type: "practice" },
  { text: "Some cups are spoons", type: "practice" }
];

// Define the experimental dot patterns
// Each pattern is an array of positions (1-9, row-major order: 1=top-left, 2=top-middle, 3=top-right, etc.)
const easyPatterns = [
  { type: 'easy', dots: [1, 2, 3], characteristic: 'top-row' },
  { type: 'easy', dots: [4, 5, 6], characteristic: 'middle-row' },
  { type: 'easy', dots: [7, 8, 9], characteristic: 'bottom-row' },
  { type: 'easy', dots: [1, 4, 7], characteristic: 'left-column' },
  { type: 'easy', dots: [2, 5, 8], characteristic: 'middle-column' },
  { type: 'easy', dots: [3, 6, 9], characteristic: 'right-column' },
];

const hardPatterns = [
  { type: 'hard', dots: [1, 5, 7, 9] },
  { type: 'hard', dots: [1, 6, 7, 8] },
  { type: 'hard', dots: [1, 2, 7, 9] },
  { type: 'hard', dots: [3, 4, 5, 7] },
  { type: 'hard', dots: [2, 4, 8, 9] },
  { type: 'hard', dots: [2, 3, 5, 9] },
  { type: 'hard', dots: [3, 4, 6, 8] },
  { type: 'hard', dots: [4, 6, 8, 9] },
  { type: 'hard', dots: [1, 3, 5, 7] },
  { type: 'hard', dots: [2, 4, 5, 7] },
  { type: 'hard', dots: [1, 5, 6, 8] },
  { type: 'hard', dots: [2, 3, 4, 8] },
  { type: 'hard', dots: [1, 2, 6, 8] },
  { type: 'hard', dots: [1, 3, 6, 7] },
  { type: 'hard', dots: [2, 4, 6, 9] },
  { type: 'hard', dots: [2, 5, 6, 7] },
  { type: 'hard', dots: [3, 4, 8, 9] },
  { type: 'hard', dots: [3, 5, 7, 9] },
];

// Define the experimental sentences
// Each sentence has text and type (SomeUnderinformative, SomeTrue, SomeFalse, AllTrue, AllFalse)
const sentences = [
  { text: "Some oaks are trees.", type: "SomeUnderinformative" },
  { text: "Some roses are flowers.", type: "SomeUnderinformative" },
  { text: "Some bananas are fruits.", type: "SomeUnderinformative" },
  { text: "Some carrots are vegetables.", type: "SomeUnderinformative" },
  { text: "Some parrots are birds.", type: "SomeUnderinformative" },
  { text: "Some wasps are insects.", type: "SomeUnderinformative" },
  { text: "Some sparrows are birds.", type: "SomeUnderinformative" },
  { text: "Some horses are animals.", type: "SomeUnderinformative" },
  { text: "Some salmons are fish.", type: "SomeUnderinformative" },
  { text: "Some tulips are flowers.", type: "SomeUnderinformative" },
  { text: "Some crocodiles are reptiles.", type: "SomeUnderinformative" },
  { text: "Some broccolis are vegetables.", type: "SomeUnderinformative" },
  { text: "Some birches are trees.", type: "SomeUnderinformative" },
  { text: "Some chickens are birds.", type: "SomeUnderinformative" },
  { text: "Some sharks are fish.", type: "SomeUnderinformative" },
  { text: "Some giraffes are animals.", type: "SomeUnderinformative" },
  { text: "Some trees are apple trees.", type: "SomeTrue" },
  { text: "Some flowers are poppies.", type: "SomeTrue" },
  { text: "Some reptiles are snakes.", type: "SomeTrue" },
  { text: "Some insects are flies.", type: "SomeTrue" },
  { text: "Some pigeons are insects.", type: "SomeFalse" },
  { text: "Some lemons are flowers.", type: "SomeFalse" },
  { text: "Some mosquitos are birds.", type: "SomeFalse" },
  { text: "Some dogs are vegetables.", type: "SomeFalse" },
  { text: "All cats are animals.", type: "AllTrue" },
  { text: "All crows are birds.", type: "AllTrue" },
  { text: "All ants are insects.", type: "AllTrue" },
  { text: "All cobras are snakes.", type: "AllTrue" },
  { text: "All fruits are strawberries.", type: "AllFalse" },
  { text: "All fishes are carp.", type: "AllFalse" },
  { text: "All reptiles are alligators.", type: "AllFalse" },
  { text: "All animals are donkeys.", type: "AllFalse" },
];

// Function to create HTML for the 3x3 grid
function createGridHTML(dots = [], clickable = false) {
  let html = '<div class="grid-container">';
  for (let i = 1; i <= 9; i++) {
    const hasDot = dots.includes(i);
    const className = clickable ? 'grid-cell clickable' : 'grid-cell';
    const dotClass = hasDot ? 'dot' : '';
    html += `<div class="${className}" data-position="${i}"><div class="${dotClass}"></div></div>`;
  }
  html += '</div>';
  return html;
}

// CSS for the grid (will be added to the page)
const gridCSS = `<style>
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  grid-template-rows: repeat(3, 60px);
  gap: 5px;
  margin: 20px auto;
  width: 200px;
}
.grid-cell {
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}
.grid-cell.clickable {
  cursor: pointer;
}
.grid-cell.clickable:hover {
  background-color: #f0f0f0;
}
.dot {
  width: 30px;
  height: 30px;
  background-color: #000;
  border-radius: 50%;
}
.fixation {
  font-size: 48px;
  text-align: center;
  margin: 50px;
}
.sentence {
  font-size: 24px;
  text-align: center;
  margin: 50px;
}
.buttons {
  text-align: center;
  margin: 20px;
}
.button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 18px;
}
.feedback {
  font-size: 24px;
  text-align: center;
  margin: 50px;
}
</style>`;


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create a sequence of easy dot patterns where no two consecutive patterns have the same characteristic
function createNonConsecutiveSequence(patterns, numTrials) {
  const sequence = [];
  let lastCharacteristic = null;

  for (let i = 0; i < numTrials; i++) {
    // Get patterns that don't match the last characteristic
    const available = patterns.filter(p => p.characteristic !== lastCharacteristic);
    
    // If no available patterns (shouldn't happen), use all patterns
    const pool = available.length > 0 ? available : patterns;
    
    // Randomly select one
    const selected = pool[Math.floor(Math.random() * pool.length)];
    sequence.push(selected);
    lastCharacteristic = selected.characteristic;
  }

  return sequence;
}

// Create a shuffled sequence of hard dot patterns
function createShuffledSequence(patterns, numTrials) {
  const sequence = [];
  // Repeat patterns to reach numTrials
  const repeated = [];
  const timesNeeded = Math.ceil(numTrials / patterns.length);

  for (let i = 0; i < timesNeeded; i++) {
    repeated.push(...patterns);
  }

  // Shuffle and take first numTrials
  return shuffle(repeated).slice(0, numTrials);
}

// Wrap main code execution to ensure all dependencies are loaded
function initializeExperiment() {
  console.log("Initializing experiment...");
  
  // Initialize jsPsych
  const jsPsych = initJsPsych({
    display_element: 'jspsych-content',
    on_finish: function() {
      console.log("Experiment finished!");
      
      // At the end of the experiment, save data
      const data = jsPsych.data.get().values();
      console.log("Experiment data:", data);
      
      // Try to save to Qualtrics if available
      if (typeof Qualtrics !== 'undefined' && Qualtrics.SurveyEngine) {
        Qualtrics.SurveyEngine.setEmbeddedData('jsPsychData', JSON.stringify(data));
        Qualtrics.SurveyEngine.setEmbeddedData('taskCompleted', 'true');
        if (typeof jQuery !== 'undefined') {
          jQuery('#NextButton').click();
        }
      } else {
        console.log("Not in Qualtrics - displaying data in console");
        jsPsych.data.displayData();
      }
    }
  });

  // Practice patterns and sentences in order (no shuffling)
  let practicePatternIndex = 0;
  let practiceSentenceIndex = 0;

  // Determine block order randomly (easy or hard dot patterns first)
  const blockOrder = Math.random() < 0.5 ? ['easy', 'hard'] : ['hard', 'easy'];

  // Function to get block sentences: 8 SomeUnderinformative + 2 of each other type, shuffled
  function getBlockSentences() {
    const someUnder = sentences.filter(s => s.type === 'SomeUnderinformative');
    const shuffledSomeUnder = shuffle([...someUnder]).slice(0, 8);
    const otherTypes = ['SomeTrue', 'SomeFalse', 'AllTrue', 'AllFalse'];
    const others = otherTypes.flatMap(type => {
      const filtered = sentences.filter(s => s.type === type);
      return shuffle(filtered).slice(0, 2);  // Take 2 of each type
    });
    const blockSentences = [...shuffledSomeUnder, ...others];
    return shuffle(blockSentences);
  }

  // Function to get next pattern and sentence for practice
  function getNextTrial(isPractice = false) {
    if (isPractice) {
      const pattern = practicePatterns[practicePatternIndex];
      const sentence = practiceSentences[practiceSentenceIndex];
      practicePatternIndex++;
      practiceSentenceIndex++;
      return { pattern, sentence };
    }
  }

  // Function to get next experimental trial for a block
  function getNextExperimentalTrial(blockPatterns, blockPatternIndex, blockSentences, blockSentenceIndex) {
    const pattern = blockPatterns[blockPatternIndex % blockPatterns.length];
    const sentence = blockSentences[blockSentenceIndex];
    return { pattern, sentence };
  }

  // Add CSS to the page using vanilla JavaScript instead of jQuery
  const styleElement = document.createElement('style');
  styleElement.innerHTML = gridCSS.replace(/<style>|<\/style>/g, '');
  document.head.appendChild(styleElement);

  // Create timeline
  const timeline = [];

  // Intiate fullscreen
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: true,
    message: '<p>The experiment will now go fullscreen. Press the button to continue.</p>',
    button_label: 'Continue'
  });

  // Practice instruction
  timeline.push({
    type: 'html-button-response',
    stimulus: '<div class="sentence">You will practice with some items before doing the actual experiment.</div>',
    choices: ['Start Practice'],
    button_html: '<button class="button">%choice%</button>'
  });

  // Practice trials (3 trials)
  for (let trialNum = 0; trialNum < 3; trialNum++) {
    const trial = getNextTrial(true);
    const isFirstPractice = trialNum === 0;

    // Fixation trial
    timeline.push({
      type: 'html-keyboard-response',
      stimulus: '<div class="fixation">+</div>',
      choices: "NO_KEYS",
      trial_duration: 500
    });

    // Dot pattern display
    if (isFirstPractice) {
      timeline.push({
        type: 'html-button-response',
        stimulus: createGridHTML(trial.pattern.dots) + '<p>Look at the pattern and memorise it. Press continue when ready.</p>',
        choices: ['Continue'],
        button_html: '<button class="button">%choice%</button>',
        data: { is_practice: true, block: 'practice' },
        on_finish: function(data) {
          data.pattern_type = trial.pattern.type;
          data.pattern_dots = trial.pattern.dots;
          data.sentence_text = trial.sentence.text;
          data.sentence_type = trial.sentence.type;
        }
      });
    } else {
      timeline.push({
        type: 'html-keyboard-response',
        stimulus: createGridHTML(trial.pattern.dots),
        choices: "NO_KEYS",
        trial_duration: 850,
        data: { is_practice: true, block: 'practice' },
        on_finish: function(data) {
          data.pattern_type = trial.pattern.type;
          data.pattern_dots = trial.pattern.dots;
          data.sentence_text = trial.sentence.text;
          data.sentence_type = trial.sentence.type;
        }
      });
    }

    // Sentence judgement
    timeline.push({
      type: 'html-keyboard-response',
      stimulus: `<div class="sentence">${trial.sentence.text}</div>
                 <div class="buttons">
                   <p>Press the buttons or F for True and J for False</p>
                   <button class="button" onclick="jsPsych.pluginAPI.pressKey('f')">True</button>
                   <button class="button" onclick="jsPsych.pluginAPI.pressKey('j')">False</button>
                 </div>`,
      choices: ['f', 'j'],
      data: {
        sentence_type: trial.sentence.type,
        is_practice: true,
        block: 'practice'
      },
      on_finish: function(data) {
        data.sentence_response = data.response === 'f' ? 'True' : 'False';
      }
    });

    // Dot pattern reproduction
    timeline.push({
      type: 'html-button-response',
      stimulus: `<p>Please reproduce the dot pattern you saw earlier.</p>
                 <p>Click on the grid or use your numpad (1-9) to place dots.</p>
                 <p>Press continue when you are satisfied with the grid pattern.</p>
                 ${createGridHTML([], true)}`,
      choices: ['Continue'],
      button_html: '<button class="button">%choice%</button>',
      data: { is_practice: true, block: 'practice' },
      on_load: function() {
        const selectedDots = [];
        let keydownHandler;

        document.querySelectorAll('.grid-cell.clickable').forEach(cell => {
          const clickHandler = function() {
            const pos = parseInt(this.dataset.position, 10);
            const dot = this.querySelector('.dot');
            if (dot) {
              dot.remove();
              const idx = selectedDots.indexOf(pos);
              if (idx > -1) {
                selectedDots.splice(idx, 1);
              }
            } else {
              this.innerHTML = '<div class="dot"></div>';
              if (!selectedDots.includes(pos)) {
                selectedDots.push(pos);
              }
            }
          };
          cell.addEventListener('click', clickHandler);
        });

        keydownHandler = function(e) {
          const key = parseInt(e.key, 10);
          if (key >= 1 && key <= 9) {
            e.preventDefault();
            const cell = document.querySelector(`.grid-cell[data-position="${key}"]`);
            if (cell) {
              const dot = cell.querySelector('.dot');
              if (dot) {
                dot.remove();
                const idx = selectedDots.indexOf(key);
                if (idx > -1) {
                  selectedDots.splice(idx, 1);
                }
              } else {
                cell.innerHTML = '<div class="dot"></div>';
                if (!selectedDots.includes(key)) {
                  selectedDots.push(key);
                }
              }
            }
          }
        };
        
        document.addEventListener('keydown', keydownHandler);
        window.currentKeydownHandler = keydownHandler;
        window.currentSelectedDots = selectedDots;
      },
      on_finish: function(data) {
        if (window.currentKeydownHandler) {
          document.removeEventListener('keydown', window.currentKeydownHandler);
          delete window.currentKeydownHandler;
        }
        data.reproduced_dots = window.currentSelectedDots || [];
        const lastTrial = jsPsych.data.get().last(1).values()[0];
        const correct = lastTrial.pattern_dots || [];
        const reproduced = data.reproduced_dots.sort((a, b) => a - b);
        const correctSorted = correct.sort((a, b) => a - b);
        data.reproduction_correct = JSON.stringify(reproduced) === JSON.stringify(correctSorted);
        delete window.currentSelectedDots;
      }
    });

    // Feedback
    timeline.push({
      type: 'html-button-response',
      stimulus: function() {
        const lastTrial = jsPsych.data.get().last(1).values()[0];
        if (lastTrial.reproduction_correct) {
          return '<div class="feedback">Correct reproduction!<br>Please continue the experiment.</div>';
        } else {
          // For practice, show correct pattern if wrong
          return '<div class="feedback">Incorrect reproduction!<br>Here is the correct pattern:<br>' + createGridHTML(lastTrial.correct_dots) + '<br>Please pay more attention to the dot pattern.</div>';
        }
      },
      choices: ['Continue'],
      button_html: '<button class="button">%choice%</button>',
      data: { is_practice: true, block: 'practice' }
    });
  }

  // Experiment instruction
  timeline.push({
    type: 'html-button-response',
    stimulus: '<div class="sentence">This concludes the practice trials.<br>The experiment will start now.</div>',
    choices: ['Start Experiment'],
    button_html: '<button class="button">%choice%</button>'
  });

  // Experimental blocks
  for (let blockNum = 0; blockNum < 2; blockNum++) {
    const blockType = blockOrder[blockNum];
    let blockPatterns;

    // For easy patterns, use non-consecutive sequence to avoid repeating characteristics
    // For hard patterns, use shuffled sequence
    if (blockType === 'easy') {
      blockPatterns = createNonConsecutiveSequence(easyPatterns, 12);
    } else {
      blockPatterns = createShuffledSequence(hardPatterns, 12);
    }

    let blockPatternIndex = 0;
    const blockSentences = getBlockSentences();
    let blockSentenceIndex = 0;

    // Trials for this block (12 trials)
    for (let trialNum = 0; trialNum < 12; trialNum++) {
      const trial = getNextExperimentalTrial(blockPatterns, blockPatternIndex, blockSentences, blockSentenceIndex);
      blockPatternIndex++;
      blockSentenceIndex++;

      // Fixation
      timeline.push({
        type: 'html-keyboard-response',
        stimulus: '<div class="fixation">+</div>',
        choices: "NO_KEYS",
        trial_duration: 500
      });

      // Dot pattern display
      timeline.push({
        type: 'html-keyboard-response',
        stimulus: createGridHTML(trial.pattern.dots),
        choices: "NO_KEYS",
        trial_duration: 850,
        data: { block: blockType },
        on_finish: function(data) {
          data.pattern_type = trial.pattern.type;
          data.pattern_dots = trial.pattern.dots;
          data.sentence_text = trial.sentence.text;
          data.sentence_type = trial.sentence.type;
        }
      });

      // Sentence judgement
      timeline.push({
        type: 'html-keyboard-response',
        stimulus: `<div class="sentence">${trial.sentence.text}</div>
                   <div class="buttons">
                     <button class="button" onclick="jsPsych.pluginAPI.pressKey('f')">True</button>
                     <button class="button" onclick="jsPsych.pluginAPI.pressKey('j')">False</button>
                   </div>`,
        choices: ['f', 'j'],
        data: {
          sentence_type: trial.sentence.type,
          block: blockType
        },
        on_finish: function(data) {
          data.sentence_response = data.response === 'f' ? 'True' : 'False';
        }
      });

      // Dot pattern reproduction
      timeline.push({
        type: 'html-button-response',
        stimulus: `${createGridHTML([], true)}`,
        choices: ['Continue'],
        button_html: '<button class="button">%choice%</button>',
        data: { block: blockType },
        on_load: function() {
          const selectedDots = [];
          let keydownHandler;

          document.querySelectorAll('.grid-cell.clickable').forEach(cell => {
            const clickHandler = function() {
              const pos = parseInt(this.dataset.position, 10);
              const dot = this.querySelector('.dot');
              if (dot) {
                dot.remove();
                const idx = selectedDots.indexOf(pos);
                if (idx > -1) {
                  selectedDots.splice(idx, 1);
                }
              } else {
                this.innerHTML = '<div class="dot"></div>';
                if (!selectedDots.includes(pos)) {
                  selectedDots.push(pos);
                }
              }
            };
            cell.addEventListener('click', clickHandler);
          });

          keydownHandler = function(e) {
            const key = parseInt(e.key, 10);
            if (key >= 1 && key <= 9) {
              e.preventDefault();
              const cell = document.querySelector(`.grid-cell[data-position="${key}"]`);
              if (cell) {
                const dot = cell.querySelector('.dot');
                if (dot) {
                  dot.remove();
                  const idx = selectedDots.indexOf(key);
                  if (idx > -1) {
                    selectedDots.splice(idx, 1);
                  }
                } else {
                  cell.innerHTML = '<div class="dot"></div>';
                  if (!selectedDots.includes(key)) {
                    selectedDots.push(key);
                  }
                }
              }
            }
          };

          document.addEventListener('keydown', keydownHandler);
          window.currentKeydownHandler = keydownHandler;
          window.currentSelectedDots = selectedDots;
        },
        on_finish: function(data) {
          if (window.currentKeydownHandler) {
            document.removeEventListener('keydown', window.currentKeydownHandler);
            delete window.currentKeydownHandler;
          }
          data.reproduced_dots = window.currentSelectedDots || [];
          const lastTrial = jsPsych.data.get().last(1).values()[0];
          const correct = lastTrial.pattern_dots || [];
          const reproduced = data.reproduced_dots.sort((a, b) => a - b);
          const correctSorted = correct.sort((a, b) => a - b);
          data.reproduction_correct = JSON.stringify(reproduced) === JSON.stringify(correctSorted);
          delete window.currentSelectedDots;
        }
      });

      // Feedback
      timeline.push({
        type: 'html-button-response',
        stimulus: function() {
          const lastTrial = jsPsych.data.get().last(1).values()[0];
          if (lastTrial.reproduction_correct) {
            return '<div class="feedback">Correct reproduction!<br>Please continue the experiment.</div>';
          } else {
            return '<div class="feedback">Incorrect reproduction!<br>Please pay more attention to the dot pattern.</div>';
          }
        },
        choices: ['Continue'],
        button_html: '<button class="button">%choice%</button>',
        data: { block: blockType }
      });
    }

    // Break screen between blocks (after first block)
    if (blockNum === 0) {
      timeline.push({
        type: 'html-button-response',
        stimulus: '<div class="sentence">You are now halfway along this phase of the experiment and can take a short break.<br>Press continue when you are ready to proceed.</div>',
        choices: ['Continue'],
        button_html: '<button class="button">%choice%</button>'
      });
    }
  }

  // Run the experiment
  jsPsych.run(timeline);
}

// Call initialization when DOM and all dependencies are ready
function waitForDependencies() {
  console.log("waitForDependencies called");
  console.log("initJsPsych defined:", typeof initJsPsych !== 'undefined');
  
  if (typeof initJsPsych === 'undefined') {
    console.log("initJsPsych not ready yet, waiting...");
    setTimeout(waitForDependencies, 100);
  } else {
    console.log("All dependencies ready, starting experiment");
    initializeExperiment();
  }
}

if (document.readyState === 'loading') {
  console.log("DOM still loading, waiting for DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', waitForDependencies);
} else {
  console.log("DOM already loaded, calling waitForDependencies");
  waitForDependencies();
}