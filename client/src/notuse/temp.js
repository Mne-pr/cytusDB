//SongDetail의 초창기버전. 백업용으로 쓰기로

import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Button, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

function SongDetail() {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const { songID } = useParams();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDifficultyClick = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const renderScoreGraph = () => {
    // 시간당 점수 추이 그래프를 출력하는 로직 구현
    return <div>Score Graph</div>;
  };

  const renderRanking = () => {
    // 랭킹을 출력하는 로직 구현
    return <div>Ranking</div>;
  };

  return (
    <Container maxWidth="lg">
      <Grid container>
        <Grid item xs={8}>
          <Box>
            <Grid container>
              <Grid item xs={3}>
                {/* 노래의 사진 */}
                <Box sx={{ height: '15vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="path_to_song_image.jpg" alt="Song Jacket" />
                </Box>
              </Grid>

              <Grid item xs={9}>
                {/* 노래의 곡 이름과 작곡가 */}
                <Box sx={{ height: '15vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" component="div">
                    곡 이름
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    작곡가
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{height: '5vh',  display: 'flex', alignItems: 'center', mt: 2 }}>
            {/* Easy Hard Chaos 버튼 */}
            <Button variant="contained" onClick={() => handleDifficultyClick('easy')} sx={{ width: '100%' }}>
              Easy
            </Button>
            <Button variant="contained" onClick={() => handleDifficultyClick('hard')} sx={{ width: '100%' }}>
              Hard
            </Button>
            <Button variant="contained" onClick={() => handleDifficultyClick('chaos')} sx={{ width: '100%' }}>
              Chaos
            </Button>
          </Box>

          {selectedDifficulty && (
            <Box sx={{height: '5vh'}}>
              {/* 선택된 난이도에 따른 점수 표시 라벨 */}
              <Typography variant="body1">{selectedDifficulty} : </Typography>
            </Box>
          )}

          {selectedDifficulty && (
            <Box sx={{height: '40vh'}}>
              {/* 시간 당 점수 갱신현황 그래프 */}
              {renderScoreGraph()}
            </Box>
          )}
        </Grid>
        
        <Grid item xs={4}>
          <Box sx={{ height: `${windowHeight}px` }}>
            {/* 점수에 따른 다른 유저와의 랭킹 표시 */}
            {renderRanking()}
          </Box>
        </Grid>
        
      </Grid>
    </Container>
  );
}


export default SongDetail;