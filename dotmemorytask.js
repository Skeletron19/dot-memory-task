// Dot Memory Task for Qualtrics Survey
// Based on De Neys & Schaeken (2007) and Dieussaert et al. (2011)
// This code uses jsPsych to implement a dot pattern memory task with sentence judgment

// Define the practice dot patterns in strict order
const practicePatterns = [
  { type: 'practice', dots: [1, 5, 9] }, // diagonal
  { type: 'practice', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, // all dots
  { type: 'practice', dots: [1, 4, 5, 6, 9] } // cross-like
];

// Define the practice sentences in strict order
const practiceSentences = [
  { text: "All circles are square", type: "practice" },
  { text: "Some pens are blue", type: "practice" },
  { text: "Some cups are spoons", type: "practice" }
];

// Define the experimental dot patterns manually here
// Each pattern is an array of positions (1-9, row-major order: 1=top-left, 2=top-middle, 3=top-right, etc.)
const easyPatterns = [
  { type: 'easy', dots: [1, 2, 3] }, // top row
  { type: 'easy', dots: [4, 5, 6] }, // middle row
  { type: 'easy', dots: [7, 8, 9] }, // bottom row
  { type: 'easy', dots: [1, 4, 7] }, // left column
  { type: 'easy', dots: [2, 5, 8] }, // middle column
  { type: 'easy', dots: [3, 6, 9] }, // right column
];

const hardPatterns = [
  { type: 'hard', dots: [1, 3, 7, 9] }, // corners
  { type: 'hard', dots: [2, 4, 6, 8] }, // edges
  { type: 'hard', dots: [1, 2, 5, 9] }, // L shape
  { type: 'hard', dots: [1, 3, 5, 7] }, // diagonal-ish
];

// Define the experimental sentences manually here
// Each sentence has text and type (SomeUnderinformative, SomeTrue, SomeFalse, AllTrue, AllFalse)
const sentences = [
  { text: "Some animals are mammals.", type: "SomeUnderinformative" },
  { text: "All birds can fly.", type: "AllFalse" },
  { text: "Some fruits are apples.", type: "SomeTrue" },
  { text: "All mammals give live birth.", type: "AllTrue" },
  { text: "Some vehicles are cars.", type: "SomeUnderinformative" },
  // Add more sentences as needed
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

// Wrap main code execution to ensure all dependencies are loaded
function initializeExperiment() {
  // Initialize jsPsych
  const jsPsych = initJsPsych({
    display_element: 'jspsych-content',
    on_finish: function() {
      // At the end of the experiment, save data to Qualtrics
      Qualtrics.SurveyEngine.setEmbeddedData('jsPsychData', JSON.stringify(jsPsych.data.get().values()));
      // Continue to next question block
      Qualtrics.SurveyEngine.setEmbeddedData('taskCompleted', 'true');
      jQuery('#NextButton').click();
    }
  });

  // Practice patterns and sentences in strict order (no shuffling)
  let practicePatternIndex = 0;
  let practiceSentenceIndex = 0;

  // Determine block order randomly
  const blockOrder = Math.random() < 0.5 ? ['easy', 'hard'] : ['hard', 'easy'];

  // Function to get block sentences: 8 SomeUnderinformative + 1 of each other type, shuffled
  function getBlockSentences() {
    const someUnder = sentences.filter(s => s.type === 'SomeUnderinformative');
    const shuffledSomeUnder = shuffle([...someUnder]).slice(0, 8);
    const otherTypes = ['SomeTrue', 'SomeFalse', 'AllTrue', 'AllFalse'];
    const others = otherTypes.map(type => {
      const filtered = sentences.filter(s => s.type === type);
      return shuffle(filtered)[0];
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

  // Add CSS to the page
  jQuery('head').append(gridCSS);

  // Create timeline
  const timeline = [];

  // Fullscreen trial (only once at the beginning)
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
        stimulus: createGridHTML(trial.pattern.dots) + '<p>Look at the pattern. Press continue when ready.</p>',
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

    // Sentence judgment
    timeline.push({
      type: 'html-keyboard-response',
      stimulus: `<div class="sentence">${trial.sentence.text}</div>
                 <div class="buttons">
                   <p>Press F for True or J for False</p>
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
                 <p>Use mouse clicks or numpad (1-9) to place dots.</p>
                 ${createGridHTML([], true)}`,
      choices: ['Submit'],
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
    stimulus: '<div class="sentence">The real experiment will start now.</div>',
    choices: ['Start Experiment'],
    button_html: '<button class="button">%choice%</button>'
  });

  // Experimental blocks
  for (let blockNum = 0; blockNum < 2; blockNum++) {
    const blockType = blockOrder[blockNum];
    const blockPatterns = blockType === 'easy' ? shuffle([...easyPatterns]) : shuffle([...hardPatterns]);
    let blockPatternIndex = 0;
    const blockSentences = getBlockSentences();
    let blockSentenceIndex = 0;

    // Trials for this block (12 trials)
    for (let trialNum = 0; trialNum < 12; trialNum++) {
      const trial = getNextExperimentalTrial(blockPatterns, blockPatternIndex, blockSentences, blockSentenceIndex);
      blockPatternIndex++;
      blockSentenceIndex++;

      // Fixation trial
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

      // Sentence judgment
      timeline.push({
        type: 'html-keyboard-response',
        stimulus: `<div class="sentence">${trial.sentence.text}</div>
                   <div class="buttons">
                     <p>Press F for True or J for False</p>
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
        stimulus: `<p>Please reproduce the dot pattern you saw earlier.</p>
                   <p>Use mouse clicks or numpad (1-9) to place dots.</p>
                   ${createGridHTML([], true)}`,
        choices: ['Submit'],
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
        stimulus: '<div class="sentence">You are now halfway along this phase of the experiment and can take a short break.</div>',
        choices: ['Continue'],
        button_html: '<button class="button">%choice%</button>'
      });
    }
  }

  // Run the experiment
  jsPsych.run(timeline);
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExperiment);
} else {
  initializeExperiment();
}
