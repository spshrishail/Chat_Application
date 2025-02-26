import { AppBar, Toolbar, Typography } from '@mui/material';
import ProfileMenu from './ProfileMenu';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chat App
        </Typography>
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 