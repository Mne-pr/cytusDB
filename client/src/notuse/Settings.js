import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, Typography, TextField, Button } from '@mui/material';

// 테마 생성
const theme = createTheme();

// 설정 화면 컴포넌트
function SettingsScreen() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const totalPlayCount = 100;
  const recentSong = "Last Song";
  const accountCreationDate = "2022-01-01";

  useEffect(() => {
    const handleScroll = () => {
      setLastScrollPosition(scrollPosition);
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollPosition]);

  useEffect(() => {
    if (scrollPosition > lastScrollPosition) {
      setShowAdditionalInfo(true);
    } else {
      setShowAdditionalInfo(false);
    }
  }, [scrollPosition, lastScrollPosition]);

  const handleUpdateClick = () => {
    // 유저 정보 업데이트 로직 구현
    console.log('닉네임:', nickname);
    console.log('이메일:', email);
    console.log('비밀번호:', password);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 8,
            minHeight: '100vh',
          }}
        >
          {/* 중앙에 표시되는 숫자 */}
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
              opacity: scrollPosition > 0 ? 0 : 1,
              '&.scrolled': {
                transform: 'translate(-50%, -80%)',
              },
              '&.scrolled-up': {
                transform: 'translate(-50%, -50%)',
              },
            }}
            className={scrollPosition > 0 ? 'scrolled' : ''}
          >
            <Typography variant="h2" component="div">
              클리어한 곡 수 / 게임의 전체 곡 수
            </Typography>
          </Box>

          {/* 유저에 대한 추가 정보 */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, ${showAdditionalInfo ? '-60%' : '-50%'})`,
              transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
              opacity: showAdditionalInfo ? 1 : 0,
            }}
          >
            {/* 추가 정보 내용 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ minWidth: '100px' }}>
                  총 플레이 횟수
                </Typography>
                <Typography variant="h4" component="div">
                  {totalPlayCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ minWidth: '100px' }}>
                  최근 플레이한 곡
                </Typography>
                <Typography variant="body1" component="div">
                  {recentSong}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ minWidth: '100px' }}>
                  계정 생성일
                </Typography>
                <Typography variant="body1" component="div">
                  {accountCreationDate}
                </Typography>
              </Box>
            </Box>

            {/* 유저 정보 변경 폼 */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ minWidth: '100px' }}>
                  닉네임
                </Typography>
                <TextField
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ minWidth: '100px' }}>
                  이메일
                </Typography>
                <TextField
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ minWidth: '100px' }}>
                  비밀번호
                </Typography>
                <TextField
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Button variant="contained" onClick={handleUpdateClick}>
                변경
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SettingsScreen;
