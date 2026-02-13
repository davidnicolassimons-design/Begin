import React, { useEffect, useState, useCallback, useRef } from 'react';
import ForgeReconciler, {
  Text,
  Button,
  Textfield,
  Box,
  Inline,
  Stack,
  Heading,
  Lozenge,
  SectionMessage,
  xcss,
} from '@forge/react';

// Map section indices to lozenge appearances
const LOZENGE_APPEARANCES = [
  'inprogress',
  'removed',
  'success',
  'new',
  'moved',
  'default',
  'inprogress',
  'removed',
  'success',
  'new',
  'moved',
  'default',
];

// Firework frames for the celebration animation
const FIREWORK_FRAMES = [
  '  *  .  *  .  *  .  *  .  *  ',
  '.  *  .  *  .  *  .  *  .  *',
  '  *  .  *  .  *  .  *  .  *  ',
  '*  .  *  .  *  .  *  .  *  .',
];

const CELEBRATION_MESSAGES = [
  'CONGRATULATIONS!',
  'WE HAVE A WINNER!',
  'AMAZING!',
  'FANTASTIC!',
  'INCREDIBLE!',
];

// Phases of the app
const PHASE_SETUP_COUNT = 'setup_count';
const PHASE_SETUP_NAMES = 'setup_names';
const PHASE_READY = 'ready';
const PHASE_SPINNING = 'spinning';
const PHASE_RESULT = 'result';

const App = () => {
  const [phase, setPhase] = useState(PHASE_SETUP_COUNT);
  const [sectionCount, setSectionCount] = useState('');
  const [sections, setSections] = useState([]);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [currentNameInput, setCurrentNameInput] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [fireworkFrame, setFireworkFrame] = useState(0);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Spinning animation state
  const spinStepRef = useRef(0);
  const spinTimerRef = useRef(null);

  // Firework animation
  useEffect(() => {
    if (phase === PHASE_RESULT) {
      const interval = setInterval(() => {
        setFireworkFrame((prev) => (prev + 1) % FIREWORK_FRAMES.length);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Handle section count submission
  const handleCountSubmit = useCallback(() => {
    const count = parseInt(sectionCount, 10);
    if (isNaN(count) || count < 2 || count > 12) {
      setErrorMsg('Please enter a number between 2 and 12.');
      return;
    }
    setErrorMsg('');
    setSections(new Array(count).fill(''));
    setCurrentNameIndex(0);
    setCurrentNameInput('');
    setPhase(PHASE_SETUP_NAMES);
  }, [sectionCount]);

  // Handle name submission for each section
  const handleNameSubmit = useCallback(() => {
    const name = currentNameInput.trim();
    if (!name) {
      setErrorMsg('Please enter a name for this section.');
      return;
    }
    setErrorMsg('');
    const newSections = [...sections];
    newSections[currentNameIndex] = name;
    setSections(newSections);

    if (currentNameIndex + 1 < sections.length) {
      setCurrentNameIndex(currentNameIndex + 1);
      setCurrentNameInput('');
    } else {
      setPhase(PHASE_READY);
    }
  }, [currentNameInput, currentNameIndex, sections]);

  // Spin the wheel
  const handleSpin = useCallback(() => {
    if (sections.length === 0) return;

    setPhase(PHASE_SPINNING);
    setWinnerIndex(-1);

    // Total steps for the spin animation (longer = more dramatic)
    const totalSteps = 30 + Math.floor(Math.random() * 20);
    // Random final position
    const finalIndex = Math.floor(Math.random() * sections.length);
    // Ensure we land on the right index after cycling
    const adjustedTotal =
      totalSteps - (totalSteps % sections.length) + finalIndex;

    let step = 0;

    const doStep = () => {
      const currentIdx = step % sections.length;
      setHighlightedIndex(currentIdx);

      step++;
      if (step <= adjustedTotal) {
        // Slow down as we approach the end (easing)
        const progress = step / adjustedTotal;
        let delay;
        if (progress < 0.5) {
          delay = 80;
        } else if (progress < 0.75) {
          delay = 150;
        } else if (progress < 0.9) {
          delay = 250;
        } else {
          delay = 400;
        }
        spinTimerRef.current = setTimeout(doStep, delay);
      } else {
        // Spinning is done
        setWinnerIndex(finalIndex);
        setHighlightedIndex(finalIndex);
        setCelebrationMsg(
          CELEBRATION_MESSAGES[
            Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
          ]
        );
        setPhase(PHASE_RESULT);
      }
    };

    doStep();
  }, [sections]);

  // Re-spin
  const handleReSpin = useCallback(() => {
    setFireworkFrame(0);
    handleSpin();
  }, [handleSpin]);

  // Start over
  const handleStartOver = useCallback(() => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    setPhase(PHASE_SETUP_COUNT);
    setSectionCount('');
    setSections([]);
    setCurrentNameIndex(0);
    setCurrentNameInput('');
    setHighlightedIndex(-1);
    setWinnerIndex(-1);
    setErrorMsg('');
  }, []);

  // ============ RENDER PHASES ============

  // Phase 1: Setup section count
  if (phase === PHASE_SETUP_COUNT) {
    return (
      <Stack space="space.200">
        <Heading as="h2">Wheel of Fortune</Heading>
        <Text>Welcome! Set up your wheel by choosing how many sections it will have.</Text>
        <Box>
          <Text>How many sections? (2-12)</Text>
          <Textfield
            value={sectionCount}
            onChange={(e) => setSectionCount(e.target.value)}
            placeholder="Enter a number (2-12)"
          />
        </Box>
        {errorMsg && (
          <SectionMessage appearance="error">
            <Text>{errorMsg}</Text>
          </SectionMessage>
        )}
        <Button appearance="primary" onClick={handleCountSubmit}>
          Next
        </Button>
      </Stack>
    );
  }

  // Phase 2: Setup section names
  if (phase === PHASE_SETUP_NAMES) {
    return (
      <Stack space="space.200">
        <Heading as="h2">Wheel of Fortune</Heading>
        <Text>
          Enter a name for each section of the wheel.
        </Text>
        <SectionMessage appearance="info">
          <Text>
            Section {currentNameIndex + 1} of {sections.length}
          </Text>
        </SectionMessage>
        {/* Show already entered sections */}
        {currentNameIndex > 0 && (
          <Inline space="space.100" shouldWrap>
            {sections.slice(0, currentNameIndex).map((name, idx) => (
              <Lozenge
                key={idx}
                appearance={LOZENGE_APPEARANCES[idx % LOZENGE_APPEARANCES.length]}
              >
                {name}
              </Lozenge>
            ))}
          </Inline>
        )}
        <Box>
          <Text>Name for section {currentNameIndex + 1}:</Text>
          <Textfield
            value={currentNameInput}
            onChange={(e) => setCurrentNameInput(e.target.value)}
            placeholder={`Section ${currentNameIndex + 1} name`}
          />
        </Box>
        {errorMsg && (
          <SectionMessage appearance="error">
            <Text>{errorMsg}</Text>
          </SectionMessage>
        )}
        <Inline space="space.100">
          <Button appearance="primary" onClick={handleNameSubmit}>
            {currentNameIndex + 1 < sections.length ? 'Next Section' : 'Finish Setup'}
          </Button>
          <Button appearance="subtle" onClick={handleStartOver}>
            Start Over
          </Button>
        </Inline>
      </Stack>
    );
  }

  // Phase 3: Ready to spin
  if (phase === PHASE_READY) {
    return (
      <Stack space="space.200">
        <Heading as="h2">Wheel of Fortune</Heading>
        <Text>Your wheel is ready! Here are the sections:</Text>
        <WheelDisplay
          sections={sections}
          highlightedIndex={-1}
          winnerIndex={-1}
        />
        <Inline space="space.100">
          <Button appearance="primary" onClick={handleSpin}>
            SPIN THE WHEEL!
          </Button>
          <Button appearance="subtle" onClick={handleStartOver}>
            Start Over
          </Button>
        </Inline>
      </Stack>
    );
  }

  // Phase 4: Spinning
  if (phase === PHASE_SPINNING) {
    return (
      <Stack space="space.200">
        <Heading as="h2">Wheel of Fortune</Heading>
        <SectionMessage appearance="warning">
          <Text>The wheel is spinning...</Text>
        </SectionMessage>
        <WheelDisplay
          sections={sections}
          highlightedIndex={highlightedIndex}
          winnerIndex={-1}
        />
      </Stack>
    );
  }

  // Phase 5: Result with fireworks
  if (phase === PHASE_RESULT) {
    return (
      <Stack space="space.200">
        <Heading as="h2">Wheel of Fortune</Heading>
        <Text>{FIREWORK_FRAMES[fireworkFrame]}</Text>
        <SectionMessage appearance="success">
          <Stack space="space.100">
            <Text>{celebrationMsg}</Text>
            <Heading as="h1">{sections[winnerIndex]}</Heading>
          </Stack>
        </SectionMessage>
        <Text>{FIREWORK_FRAMES[(fireworkFrame + 2) % FIREWORK_FRAMES.length]}</Text>
        <WheelDisplay
          sections={sections}
          highlightedIndex={winnerIndex}
          winnerIndex={winnerIndex}
        />
        <Inline space="space.100">
          <Button appearance="primary" onClick={handleReSpin}>
            SPIN AGAIN!
          </Button>
          <Button appearance="subtle" onClick={handleStartOver}>
            New Wheel
          </Button>
        </Inline>
      </Stack>
    );
  }

  return <Text>Something went wrong. Please reload.</Text>;
};

// Wheel display component showing all sections
const WheelDisplay = ({ sections, highlightedIndex, winnerIndex }) => {
  return (
    <Box
      xcss={xcss({
        padding: 'space.200',
        borderRadius: 'border.radius.100',
        borderStyle: 'solid',
        borderWidth: 'border.width',
        borderColor: 'color.border',
      })}
    >
      <Stack space="space.100">
        {sections.map((name, idx) => {
          const isHighlighted = idx === highlightedIndex;
          const isWinner = idx === winnerIndex;

          return (
            <Box
              key={idx}
              xcss={xcss({
                padding: 'space.100',
                borderRadius: 'border.radius.100',
                backgroundColor: isWinner
                  ? 'color.background.success.bold'
                  : isHighlighted
                  ? 'color.background.warning'
                  : 'color.background.neutral',
              })}
            >
              <Inline space="space.100" alignBlock="center">
                <Text>
                  {isHighlighted ? '>>>' : '   '}
                </Text>
                <Lozenge
                  appearance={
                    isWinner
                      ? 'success'
                      : LOZENGE_APPEARANCES[idx % LOZENGE_APPEARANCES.length]
                  }
                  isBold={isHighlighted}
                >
                  {`${idx + 1}`}
                </Lozenge>
                <Text>
                  {isWinner
                    ? `*** ${name} ***`
                    : name}
                </Text>
                <Text>
                  {isHighlighted ? '<<<' : '   '}
                </Text>
              </Inline>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
