import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import TeamsMeetings from './TeamsMeetings';
import AddMeeting from './AddMeeting';

function App() {
  return (
    <>

      {/* תפריט עליון (Navbar) */}
      <AppBar position="static" sx={{backgroundColor: '#433592ff'}}>
         
        <Toolbar>
          <Typography variant="h6" component="div">
            Company Meetings
          </Typography>
      
          {/* כפתורי ניווט */}
          <Button color="inherit" component={Link} to="/">
            Teams & Meetings
          </Button>
          <Button color="inherit" component={Link} to="/add-meeting">
            Add Meeting
          </Button>
        </Toolbar>
      </AppBar>

      {/* איזור התוכן המתחלף */}
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