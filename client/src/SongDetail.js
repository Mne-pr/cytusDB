import React, { useState, useEffect } from 'react'
import { Container, Grid, Box, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function SongDetail() {
  const [selectedDifficulty, setSelectedDifficulty] = useState() // 선택된 난이도
  const [user, setUser] = useState('') // 선택한 유저
  const [score, setScore] = useState() // 점수
  const [ranking, setRanking] = useState([]) // 랭킹
  const [songInfo, setSongInfo] = useState({ // 곡 정보
    songName: '',
    composer: '',
    releaseDate: '',
    songImage: null,
    difficulties: []
  })

  const { songID } = useParams()
  const EXPRESS_URL = 'https://cytus2testserver.run.goorm.site'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 토큰 검증
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(EXPRESS_URL + '/verifyToken', {
            method: 'GET',
            headers: {
              'x-access-token': token
            }
          });
          const userData = await response.json();
          setUser(userData);
        } else {
          window.location.href = '/';
        }

        // 곡 정보 가져오기
        const songInfoResponse = await axios.get( EXPRESS_URL + `/api/getSongInfo/${songID}` )
        const fetchedSongInfo = songInfoResponse.data
        const difficultiesArray = fetchedSongInfo.difficulties.split(', ');
        setSongInfo(prevSongInfo => ({
          songName: fetchedSongInfo.songName,
          composer: fetchedSongInfo.composer,
          releaseDate:fetchedSongInfo.releaseDate,
          songImage: fetchedSongInfo.songImage,
          difficulties: difficultiesArray   
        }))

      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }    
    fetchData()
  }, [])


  const handleDifficultyClick = async (difficulty) => {
    try {
      // 정보 읽어오기 - 해당 곡, 난이도에 대한 점수/랭킹
      const ScoreNRank = await axios.get(EXPRESS_URL + `/api/getRanking/${user.userID}/${songID}/${difficulty}`); 
      const transformedRank = ScoreNRank.data.rank.map(item => [item.nick, item.score])
      setRanking(transformedRank)
      setScore(ScoreNRank.data.score)

      setSelectedDifficulty(difficulty);
    } catch (error) {
      console.error('Error fetching ranking data:', error);
    }
  };

  const renderNoItem = () => {
    // 시간당 점수 추이 그래프를 출력하는 로직 구현
    return '그래프, 평균, 분산 등(미정)';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '98vh'}}>

        {/*왼쪽 박스 - 사진, 제목, 버튼, (그래프, 평균, 분산 등(미정))*/}
        <Box sx={{ width: '73%', height: '95vh'}}> 
          {/*사진, 곡이름, 작곡가*/}
          <Box>
            <Box sx={{ display: 'flex' }}>

              <Box sx={{ width: '30%' }}>
                {/* 노래의 사진 */}
                <Box sx={{ height: '15vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`data:image/webp;base64,${songInfo.songImage}`} alt="Song Jacket" style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }} />
                </Box>
              </Box>

              <Box sx={{ width: '70%' }}>
                {/* 노래의 곡 이름과 작곡가 */}
                <Box sx={{ height: '15vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" component="div">
                    {songInfo.songName}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {songInfo.composer}
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Box>

          {/*난이도버튼*/}
          <Box sx={{ height: '5vh', display: 'flex', alignItems: 'center', m:0 }}>
            {/* 난이도 버튼들 */}
            {songInfo.difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "contained" : "outlined"}
                onClick={() => handleDifficultyClick(difficulty)}
                sx={{ width: '100%' }}
              >
                {difficulty}
              </Button>
            ))}
          </Box>

          {/*점수표시*/}
          {selectedDifficulty ? (
            <Box sx={{ height: '10vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* 선택된 난이도에 따른 점수 표시 라벨 */}
              <Typography variant="h4">{score}</Typography>
            </Box>
          ) : (
            <Box sx={{ height: '10vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* 선택 안 된 경우 표시  */}
            </Box>   
          )}

          {/*미정*/}
          {selectedDifficulty ? (
            <Box sx={{height: '65vh', display: 'flex', borderRadius: '8px', border: '2px solid #000', alignItems: 'center', justifyContent: 'center'}}>
              {/* 시간 당 점수 갱신현황 그래프 */}
              <Typography variant="h4">
                {`그래프, 평균, 분산 등(미정)`}
              </Typography>
            </Box>
          ) : (
            <Box sx={{height: '65vh', display: 'flex', borderRadius: '8px', border: '2px solid #000', alignItems: 'center', justifyContent: 'center'}}>
              {/* 선택 안 된 경우 표시 */}
              <Typography variant="h4">
                {`그래프, 평균, 분산 등(미정)`}
              </Typography>
            </Box>
          )}          
        </Box>

        {/*빈 박스*/}
        <Box sx={{ width: '2%', height: '95vh'}}>
        </Box>

        {/* 오른쪽 박스 - 랭킹 */}
        <Box
          sx={{
            width: "25%",
            height: "95vh",
            borderRadius: "8px",
            border: "2px solid #000",
            overflowY: "auto",
          }}
        >
          {/* 점수에 따른 다른 유저와의 랭킹 표시 */}
          <List>
            {ranking.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    backgroundColor: item[0] === user.nick ? "#f0f0f0" : "inherit",
                    justifyContent: "center",
                  }}
                >
                  <ListItemText primary={item[0]} />
                  <ListItemText primary={item[1]} sx={{ textAlign: "right" }} />
                </ListItem>
                {index < ranking.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>

      </Box>
    </Container>

  );
}

export default SongDetail;
