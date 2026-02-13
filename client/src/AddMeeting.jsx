import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // הוק לניווט בין דפים
import { 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Box, 
    Paper 
} from '@mui/material';

function AddMeeting() {
    const navigate = useNavigate(); // מאפשר לנו להעביר את המשתמש דף בקוד

    // State לשמירת רשימת הקבוצות (בשביל ה-Select)
    const [teams, setTeams] = useState([]);

    // State אחד שמחזיק את כל שדות הטופס
    const [meetingData, setMeetingData] = useState({
        team_id: '',
        start_time: '',
        end_time: '',
        description: '',
        room_name: ''
    });

    // בטעינת הדף - נביא את הקבוצות
    useEffect(() => {
        axios.get('http://localhost:3001/api/teams')
            .then(response => setTeams(response.data))
            .catch(error => console.error("Error fetching teams:", error));
    }, []);

    // פונקציה כללית לטיפול בשינוי בכל אחד מהשדות
    const handleChange = (event) => {
        // name = שם השדה (למשל description), value = הערך שהוקלד
        const { name, value } = event.target;
        
        // עדכון ה-State: שומרים על מה שהיה (...) ומעדכנים רק את השדה הספציפי
        setMeetingData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // שליחת הטופס
    const handleSubmit = async (event) => {
        event.preventDefault(); // מניעת רענון הדף הרגיל של הדפדפן

        try {
            await axios.post('http://localhost:3001/api/meetings', meetingData);
            alert('Meeting added successfully!');
            navigate('/'); // החזרה לדף הבית כדי לראות את הפגישה
        } catch (error) {
            console.error("Error adding meeting:", error);
            alert("Failed to add meeting.");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Add New Meeting
                </Typography>

                <form onSubmit={handleSubmit}>
                    {/* בחירת קבוצה */}
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Select Team</InputLabel>
                        <Select
                            name="team_id"
                            value={meetingData.team_id}
                            label="Select Team"
                            onChange={handleChange}
                        >
                            {teams.map((team) => (
                                <MenuItem key={team.team_id} value={team.team_id}>
                                    {team.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* זמנים - שימי לב לשימוש ב-InputLabelProps כדי שהתווית לא תסתיר את התאריך */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Start Time"
                        type="datetime-local"
                        name="start_time"
                        value={meetingData.start_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="End Time"
                        type="datetime-local"
                        name="end_time"
                        value={meetingData.end_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        name="description"
                        value={meetingData.description}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Room Name"
                        name="room_name"
                        value={meetingData.room_name}
                        onChange={handleChange}
                        required
                    />

                    <Box sx={{ mt: 3 }}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Add Meeting
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default AddMeeting;