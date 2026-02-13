import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CardMedia } from '@mui/material';
import TeamsMeetings from './TeamsMeetings';
import AddMeeting from './AddMeeting';
import logo from './assets/MeetingscalLogo.png';

function App() {
  return (
    <>

        <AppBar position="static" sx={{backgroundColor: '#433592ff'}}>
           
          <Toolbar>

            <Box component="img" src={logo} alt="Company Logo"
            sx={{ 
              height: 65,       // גובה הלוגו (תשחקי עם זה אם הוא גדול/קטן מדי)
              marginRight: 2,   // רווח מהטקסט
              display: { xxs: 'none', md: 'block' } // מוסתר בנייד, מוצג במסך גדול
            }} 
          />

            <Typography variant="h6" component="div">
          Meetings Calander
            </Typography>

            {/* כפתורי ניווט */}
          <Button color="inherit" component={Link} to="/" fontWeight="Bold">
            Teams & Meetings
          </Button>
          <Button color="inherit" component={Link} to="/add-meeting" fontWeight="Bold">
            Add Meeting
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 4 }}>
        <Routes>
          {/* נתיב לדף הראשי */}
          <Route path="/" element={<TeamsMeetings/>} />
          {/* נתיב לדף הוספת פגישה */}
          <Route path="/add-meeting" element={<AddMeeting />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;