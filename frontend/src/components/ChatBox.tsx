import MicButton from "./MicButton";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import styles from './ChatBox.module.scss';

interface Props {
  messages: any[];
  input: string;
  setInput: (v: string) => void;
  send: () => void;
}

export default function ChatBox({
  messages,
  input,
  setInput,
  send,
}: Props) {
  return (
    <Box className={styles.chat}>
      <Paper elevation={1} square className={styles.messages}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography
              variant="body1"
              className={m.role === 'user' ? styles.messageUser : styles.messageAi}
            >
              {m.text}
            </Typography>
          </Box>
        ))}
      </Paper>

      <Box className={styles.inputArea} component="form">
        <MicButton onResult={(t) => setInput((prev) => (prev ? prev + ' ' + t : t))} />

        <TextField
          className={styles.inputField}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nói hoặc nhập câu hỏi..."
          size="small"
          variant="filled"
          InputProps={{ disableUnderline: true }}
        />

        <Button variant="contained" color="primary" onClick={send}>
          Gửi
        </Button>
      </Box>
    </Box>
  );
}
