import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import { post, get } from './sendRequest';
import { Button, Badge, Form, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './App.module.scss';
import { useEffect, useState } from 'react';

interface Voice {
    label: string;
    value: string;
}

function App() {
    const [text, setText] = useState('');
    const [voices, setVoices] = useState<Voice[]>([]);
    const [voice, setVoice] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownLoading, setDropdownLoading] = useState(false);

    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    useEffect(() => {
        setText(transcript);
    }, [transcript]);

    useEffect(() => {
        setDropdownLoading(true);
        get('http://localhost:8000/voice/voice-model').then((data) => {
            setVoices(data);
            setDropdownLoading(false);
        });
    }, []);

    const handleStart = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-EN',
        });
    };

    const handleStop = () => {
        SpeechRecognition.stopListening();
    };

    const sendText = () => {
        setIsLoading(true);

        return post({
            url: 'http://localhost:8000/voice',
            data: { text, voice },
            options: {
                headers: {
                    'Content-type': 'application/json',
                },
                // mode: 'no-cors'
            },
        })
            .then((data) => {
                setAudioUrl(data.path);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err)
                setIsLoading(false)
            });
    };

    const changeText = (e: any) => {
        setText(e.target.value);
    };

    const selectVoice = (e: any) => {
        setVoice(e.target.value);
    };

    const handleReset = () => {
        resetTranscript();
        setAudioUrl('');
        setText('');
    };

    return (
        <div className={styles.App}>
            <div className={styles.leftWindow}>
                <p>
                    Microphone:{' '}
                    {listening ? (
                        <Badge bg="success">on</Badge>
                    ) : (
                        <Badge bg="danger">off</Badge>
                    )}
                </p>
                <div className={styles.controls}>
                    <div className={styles.buttons}>
                        <Button
                            variant="success"
                            onClick={handleStart}
                            className={styles.button}
                        >
                            Start
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleStop}
                            className={styles.button}
                        >
                            Stop
                        </Button>
                        <Button
                            variant="warning"
                            onClick={handleReset}
                            className={styles.button}
                        >
                            Reset
                        </Button>
                    </div>
                    <Form.Select
                        id="dropdown-basic-button"
                        title="Voices"
                        className={styles.dropdown}
                        onChange={selectVoice}
                    >
                        <option>
                            {dropdownLoading ? 
                                'Loading...' : (
                                'Please, select a voice'
                            )}
                        </option>

                        {voices.map(({ label, value }, index) => (
                            <option key={label + index} value={value}>
                                {label}
                            </option>
                        ))}
                    </Form.Select>
                </div>
            </div>
            <div className={styles.rightWindow}>
                <Form.Control
                    as="textarea"
                    className={styles.textarea}
                    value={text}
                    onChange={changeText}
                />
            </div>
            <Button onClick={sendText} className={styles.send}>
                {isLoading ? (
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                ) : (
                    'Send text'
                )}
            </Button>
            {audioUrl && (
                <audio controls>
                    <source src={audioUrl} type="audio/wav" />
                    Your browser does not support the audio tag.
                </audio>
            )}
        </div>
    );
}

export default App;
