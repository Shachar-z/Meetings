import { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
    Container, 
    Typography, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider    
} from '@mui/material';

function TeamsMeetings() {
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/teams')
            .then(response => {
                setTeams(response.data);
            })
            .catch(error => {
                console.error("Error fetching teams:", error);
            });
    }, []); 

    useEffect(() => {
        if (selectedTeamId) {
            axios.get(`http://localhost:3001/api/meetings/${selectedTeamId}`)
                .then(response => setMeetings(response.data))
                .catch(error => console.error("Error fetching meetings:", error));
        }
    }, [selectedTeamId]); 
    const handleTeamChange = (event) => {
        setSelectedTeamId(event.target.value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }); 
    };

   const getDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const diffInMs = endDate - startDate;
        
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        if (hours > 0) {
            return `${hours} hours ${minutes > 0 ? `and ${minutes} minutes` : ''}`;
        }
        return `${minutes} minutes`;
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Teams Schedule
            </Typography>

            <Box sx={{ minWidth: 120, mb: 4, backgroundColor: 'white', borderRadius: 1 }}>
                <FormControl fullWidth>
                    <InputLabel>Choose Team</InputLabel>
                    <Select
                        value={selectedTeamId}
                        label="Choose Team"
                        onChange={handleTeamChange}
                    >
                        {teams.map((team) => (
                            <MenuItem key={team.team_id} value={team.team_id}>
                                {team.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Typography variant="h5" gutterBottom>
                {selectedTeamId ? 'Appointments:' : 'Select a team to see appointments'}
            </Typography>

            <Grid container spacing={2}>
                {meetings.map((meeting) => (
                    <Grid item xs={12} sm={6} key={meeting.meeting_id}>
                        <Card variant="outlined" sx={{ boxShadow: 3 }}>
                            <CardContent>
                                <Chip label={meeting.room_name} color="primary" size="small" sx={{ mb: 1 }} />
                                <Chip label={getDuration(meeting.start_time, meeting.end_time)} variant="outlined" color="warning" size="small" sx={{ mb: 1 }} />
                                <Typography variant="h6" component="div">
                                    {meeting.description}
                                </Typography>
                                
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    From: {formatDate(meeting.start_time)}
                                    <br />
                                    To: {formatDate(meeting.end_time)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            {selectedTeamId && meetings.length === 0 && (
                <Typography color="text.secondary">No meetings found for this team.</Typography>
            )}
        </Container>
    );
}

export default TeamsMeetings;
