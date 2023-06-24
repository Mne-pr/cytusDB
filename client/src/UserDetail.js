import React, { useEffect, useState } from 'react';
import { Container, Grid, Box, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function UserDetail() {
  const [user, setUser] = useState('');
  const [selectedMenu, setSelectedMenu] = useState();
  const [playResult, setPlayResult] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  
  const [songList, setSongList] = useState([]); // 곡 목록
  const [selectedSong, setSelectedSong] = useState(''); // 선택한 곡 ID
  const [difficultyList, setDifficultyList] = useState([]); // 난이도 목록 (난이도,ID)
  const [selectedDifficulty, setSelectedDifficulty] = useState([]); // 선택한 난이도
  const [inputScore, setInputScore] = useState('')

  const { userID } = useParams();
  const EXPRESS_URL = 'https://cytus2testserver.run.goorm.site';
  const MENU = ["정보 추가","정보 수정"];

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
          if (userData.admin !== 1) {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/';
        }

        // 유저 정보 가져오기
        const userInfoResponse = await axios.get(EXPRESS_URL + `/api/getUserInfo/${userID}`);
        setUserInfo(userInfoResponse.data.userRow[0]);
        setPlayResult(userInfoResponse.data.playResultData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleMenuClick = async (menu) => {
    try {
      setSelectedMenu(menu)

      // 정보 추가 메뉴일 경우 곡 목록을 가져오기
      if (menu === "정보 추가") {
        const songsResponse = await axios.get(EXPRESS_URL + '/api/songs')
        setSongList(songsResponse.data)
        console.log(songsResponse.data)
      }
      if (menu === "정보 수정") {
        setSelectedSong('')
        setSelectedDifficulty('')
      }
      
    } catch (error) {
      console.error('Error fetching ranking data:', error)
    }
  };

  const handleSongChange = async (event) => {
    const selectedSongId = event.target.value
    setSelectedSong(selectedSongId)

    // 곡을 선택했을 때 난이도 목록 가져오기
    if (selectedSongId) {
      try {
        const diffResponse = await axios.get(EXPRESS_URL + `/api/getDiff/${selectedSongId}`)
        let diff = []
        
        // 데이터가 있는지를 검사
        if (diffResponse.data && diffResponse.data.length) {
          for (let i = 0; i< diffResponse.data.length; i++){
            diff.push([diffResponse.data[i].difficultyID,diffResponse.data[i].difficulty])
          }
          setDifficultyList(diff)
          console.log(diff)
        } else {
          console.log('난이도 목록이 없네') 
        }
        
      } catch (error) {
        console.error('Error fetching difficulty data:', error)
      }
    } else {
      setDifficultyList([]) // 선택된 곡이 없으면 난이도 목록 초기화
    }
  }

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };
  
  const handleInputScoreChange = (e) => {
    const input = e.target.value
    const numericInput = input.replace(/[^0-9]/g, ''); // 숫자 이외의 문자 제거
    setInputScore(numericInput);
  }

  const handleSubmitClick = async () => {
    try{
      console.log(userID, selectedSong, selectedDifficulty, inputScore)
      const response = await axios.post(EXPRESS_URL + '/api/addPlayResult',{
      userID: userID,
      songID: selectedSong,
      difficultyID: selectedDifficulty[0],
      difficulty: selectedDifficulty[1],
      score: inputScore
      }) 
      
      console.log(response.data)
    } catch(err){
      console.error(err)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '98vh', borderRadius: "8px", border: "2px solid #000"}}>

        {/*왼쪽 박스 - 사진, 제목, 버튼, (그래프, 평균, 분산 등(미정))*/}
        <Box sx={{ width: '73%', height: '95vh'}}>
          {/*사진, 곡이름, 작곡가*/}
          <Box>
            <Box sx={{ display: 'flex' }}>

              <Box sx={{ width: '30%', borderRadius: "8px", border: "2px solid #000" }}>
                {/* 아무래도 유저 사진 - 미정*/}
                <Box sx={{ height: '15vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/*이런 방식<img src={`data:image/webp;base64,${songInfo.songImage}`} alt="Song Jacket" style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }} />*/}
                </Box>
              </Box>

              <Box sx={{ width: '70%', borderRadius: "8px", border: "2px solid #000" }}>
                {/* 유저 닉네임, 이메일, 유저아이디 */}
                <Box sx={{ height: '15vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="h4" component="div">
                    {userInfo.nick}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {'email : ', userInfo.email}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {'userID : ', userID}
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Box>

          {/*메뉴*/}
          <Box sx={{ height: '5vh', display: 'flex', alignItems: 'center', m:0, borderRadius: "8px", border: "2px solid #000" }}>
            {/* 메뉴 버튼들 */}
            {MENU.map((menu) => (
              <Button
                key={menu}
                variant={selectedMenu === menu ? "contained" : "outlined"}
                onClick={() => handleMenuClick(menu)}
                sx={{ width: '100%' }}
              >
                {menu}
              </Button>
            ))}
          </Box>

          {/*검색창 - 정보 수정일때만 생기게*/}
          {selectedMenu === "정보 수정" && (
            <Box sx={{ height: '10vh', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: "8px", border: "2px solid #000" }}>
              {/* 검색창 */}
              <Typography variant="h4">{'검색창'}</Typography>
            </Box>
          )}

          {/*메뉴 선택에 따른 출력*/}
          {selectedMenu === '정보 추가' ? (
            <Box
              sx={{
                height: '75vh',
                display: 'flex',
                borderRadius: '8px',
                border: '2px solid #000',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              {/* 정보 추가 메뉴 */}
              <FormControl sx={{ width: '70%', my: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>{'곡 선택'}</Typography>
                <Select
                  labelId="song-label"
                  id="song"
                  value={selectedSong}
                  onChange={handleSongChange}
                >
                  {songList.map((song) => (
                    <MenuItem key={song.songID} value={song.songID}>
                      {song.songName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedSong && (
                <FormControl sx={{ width: '70%', my: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>{'난이도 선택'}</Typography>
                  <Select
                    labelId="difficulty-label"
                    id="difficulty"
                    value={selectedDifficulty || difficultyList[0][1]}
                    onChange={handleDifficultyChange}
                  >
                    {difficultyList.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty[1]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedSong && (
                <FormControl sx={{ width: '70%', my: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>{'점수 입력'}</Typography>
                  <TextField
                      id="text-input"
                      fullWidth
                      value={inputScore}
                      onChange={handleInputScoreChange}
                    />
                </FormControl>              
              )}
              <Button 
                variant="contained" sx={{ my: 2 }} 
                onClick={() => handleSubmitClick()}
              > {/*이 부분부터 해야함*/}
                정보 추가
              </Button>
            </Box>
          ) : selectedMenu === '정보 수정' ? (
            <Box
              sx={{
                height: '65vh',
                display: 'flex',
                borderRadius: '8px',
                border: '2px solid #000',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* 정보 수정 메뉴 */}
              <Typography variant="h4">정보 수정</Typography>
            </Box>
          ) : (
            <Box sx={{ height: '75vh', display: 'flex', borderRadius: '8px', border: '2px solid #000' }}>
              {/* ... */}
            </Box>
          )}
        </Box>

        {/*빈 박스*/}
        <Box sx={{ width: '2%', height: '95vh'}}>
        </Box>

        {/* 오른쪽 박스 - 다른 유저들 목록 */}
        <Box
          sx={{
            width: "25%",
            height: "95vh",
            borderRadius: "8px",
            border: "2px solid #000",
            overflowY: "auto",
          }}
        >
          {/* 다른 유저 표시 - 수정 필요 */}
          {/*<List>
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
          </List>*/}
        </Box>

      </Box>
    </Container>

  )
}

export default UserDetail;
