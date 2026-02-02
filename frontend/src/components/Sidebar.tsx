import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import styles from './Sidebar.module.scss';

interface Props {
  chats: any[];
  currentChatId: number | null;
  onNewChat: () => void;
  onSelectChat: (id: number) => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
}: Props) {
  return (
    <Box className={`${styles.sidebar} panel`}>
      <Button fullWidth variant="contained" color="secondary" onClick={onNewChat} className={styles.newChatBtn}>
        + Chat mới
      </Button>

      <TextField className={styles.searchField} placeholder="Tìm đoạn chat..." size="small" fullWidth variant="filled" />

      <List>
        {chats.map((chat) => (
          <ListItemButton
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`${styles.chatItem} ${chat.id === currentChatId ? styles.chatItemActive : ''}`}
          >
            <ListItemText primary={chat.title || 'Chat mới'} />
          </ListItemButton>
        ))}
        {chats.length === 0 && (
          <Typography variant="body2" color="text.secondary">Chưa có cuộc chat nào. Tạo mới để bắt đầu.</Typography>
        )}
      </List>
    </Box>
  );
}
