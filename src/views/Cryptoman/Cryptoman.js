import React, { useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Helmet } from 'react-helmet'

import Bank from '../Bank';

import { Box, Grid, LinearProgress, Button } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/styles';

import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import Nav from '../../components/Nav/Nav';

//import useBanks from '../../hooks/useBanks';
import useTombFinance from '../../hooks/useTombFinance';

import PitImage from '../../assets/img/background.png';

// Import custom css
import "./style.css";
import { BorderLeft } from '@material-ui/icons';



const BackgroundImage = createGlobalStyle`
  body {
    background: url(${PitImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
  },
}))(LinearProgress);

const useStyles = makeStyles((theme) => ({
  stakeButtons: {
    marginRight: '1rem',
  }
}));

const Cryptoman = () => {
//  const [banks] = useBanks();
  const { path } = useRouteMatch();
  const { account, /*ethereum*/ } = useWallet();
//  const activeBanks = banks.filter((bank) => !bank.finished);
  const classes = useStyles();
  const tombFinance = useTombFinance();
  const [nftsInWallet, setNftsInWallet] = useState([]);
  const [nftsStaked, setNftsStaked] = useState([]);
  const [nftTotalSupply, setNftTotalSupply] = useState(1);
  const [nftStakedTotalSupply, setNftStakedTotalSupply] = useState(0);
  const [indexOfSelectedNft, setIndexOfselectedNft] = useState(-1);
  const [indexOfSelectedNftInWallet, setIndexOfselectedNftInWallet] = useState(-1);
  const [reward, setReward] = useState(0);
// Minting process
const [mintAmount, setMintAmount] = useState(3);

  const reloadNfts = async () => {
    if (account) {
      let nftsInWalletWithJSON = await tombFinance.getNFTsInWallet(account, 'CryptomanWalletNFT');
      setNftsInWallet(await Promise.all(
        nftsInWalletWithJSON.map(async nft => {
          return {
            tokenId: nft.tokenId,
            ...await getImageFromJSON(nft.metaDataJson)
          }
        })
      ));

      let nftsStakedWithJSON = await tombFinance.getNFTsStaked(account, 'CryptomanWalletNFT', 'CryptomanStakingNFT');
      setNftsStaked(await Promise.all(
        nftsStakedWithJSON.map(async nft => {
          return {
            tokenId: nft.tokenId,
            ...await getImageFromJSON(nft.metaDataJson)
          }
        })
      ));

      setNftTotalSupply(await tombFinance.nftTotalSupply('CryptomanWalletNFT'));
      setNftStakedTotalSupply(await tombFinance.nftStakedTotalSupply('CryptomanWalletNFT', 'CryptomanStakingNFT'));
    }
  }

  useEffect(() => {
    reloadNfts();
  }, [tombFinance, account]);

  
  const getImageFromJSON = async (json) => {
    try {
      const { image, name} = await (await fetch('https://artion3.mypinata.cloud/ipfs/' + json.replace('ipfs://', ''))).json();
      return {
        image: 'https://artion3.mypinata.cloud/ipfs/' + image.replace('ipfs://', ''),
        name,
      };
    } catch(e) {
      return await getImageFromJSON(json);
    }
  }

  const selectNftStaked = async (index) => {
    setIndexOfselectedNft(index);
    setIndexOfselectedNftInWallet(-1);
    setReward(await tombFinance.calculateRewards(account, [nftsStaked[index].tokenId], 'CryptomanStakingNFT'));
  }

  const selectNftInWallet = async (index) => {
    setIndexOfselectedNftInWallet(index);
    setIndexOfselectedNft(-1);
  }

  const stake = async () => {
    await tombFinance.stakeNfts([nftsInWallet[indexOfSelectedNftInWallet].tokenId], 'CryptomanStakingNFT');
    reloadNfts();
  }

  const unStake = async () => {
    await tombFinance.unStake(nftsStaked[indexOfSelectedNft].tokenId, 'CryptomanStakingNFT');
    reloadNfts();
  }

  const claim = async () => {
    await tombFinance.claim(nftsStaked[indexOfSelectedNft].tokenId, 'CryptomanStakingNFT');
    setReward(await tombFinance.calculateRewards(account, [nftsStaked[indexOfSelectedNft].tokenId], 'CryptomanStakingNFT'));
  }

  const approve = async () => {
    await tombFinance.approve('CryptomanWalletNFT', 'CryptomanStakingNFT');
  }

  const mint = async (amount) => {
    console.log(account);
    await tombFinance.mintNFT(account, amount);


}

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  return (
    
    <Switch>
      <Page>
                <Helmet>
          <title>8bitcats.com - Mint/Stake Cryptoman</title>
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@8bitcatsftm" />
    <meta name="twitter:title" content="8bitcats.com - Mint/Stake Cryptoman" />
    <meta name="twitter:description" content="The wildest NFT and Defi hub on the blockchain! Earn CATCOINS through yield farming and NFT Staking!" />
    <meta name="twitter:image" content="https://raw.githubusercontent.com/decenworld/cryptoman-website/main/public/config/cryptoman/100.png" />
        </Helmet>
                <Nav></Nav>

        <Route exact path={path}>
          <BackgroundImage />
          <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ textAlign:'center', marginBottom: '5px'  }}>Cryptoman</h2>
          <Grid container justify="center" spacing={0} style={{marginTop: '10px', marginBottom: '10px'}}>
                                      
            <span>
             <span style={{fontSize: '20px'}}>Total Minted
             </span>
               <br></br>{nftTotalSupply}/3000
             </span>
                 </Grid>
                     <Grid container justify="center" spacing={0} style={{marginTop: '10px', marginBottom: '10px'}}>
                     <img style={{width: '200px', height:'200px', border: '1px black solid'}} src={require('./example.gif')} />
          <Grid container justify="center" spacing={0} style={{marginTop: '10px', marginBottom: '10px'}}>

                      <h4 style={{ textAlign:'center', marginBottom: '2px'  }}>1 Cryptoman Only 2 FTM</h4>
                  </Grid>
                 </Grid>
              <span>
                      <circleButton
                        style={{ lineHeight: 0.4 }}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </circleButton>
                  
                        &nbsp;{mintAmount}&nbsp; 
           
                      <circleButtonleft
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </circleButtonleft>
                      <br></br>

                      <mintButton style={{marginTop: '10px', marginBottom: '10px' }}
    
                        onClick={(e) => {
                          console.log("mintamount", {mintAmount})
                       
                          mint(Object.values({mintAmount}))
                    

                        }}
                      >
                        Mint
                      </mintButton>

                    <br></br>
                    </span>

          
            <span style={{ fontSize: '36px' }}>
              { parseInt(nftStakedTotalSupply * 100 / nftTotalSupply) } % Cryptoman STAKED
            </span>
            <BorderLinearProgress variant="determinate" value={nftStakedTotalSupply * 100 / nftTotalSupply} />
            <br/>
            <Grid container spacing={2}>
              <Grid xs={6} item>
                <Box style={{
                  background: 'gray',
                  minHeight: '500px',
                  padding: '1rem',
                  borderRadius: '4px',
                  borderTop: '6px black solid',
                  borderBottom: '6px black solid',
                  borderRight: '6px black solid',
                  borderLeft: '6px black solid',
                  boxShadow: 'inset -4px -4px 0px 0px #292929',
                }}>
                  <p>
                    {nftsInWallet.length} NFT(s) in your wallet
                  </p>
                  <Box style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}>
                    {
                      nftsInWallet.map(({image, name}, index) => 
                        <Box style={{
                          marginRight: '1rem',
                        }}>
                          <img
                            src={image} 
                            style={{
                              border: index === indexOfSelectedNftInWallet ? '2px solid blue' : '',
                              width: '150px',
                              height: '150px',
                            }}
                            onClick={() => selectNftInWallet(index)}
                            alt="NFT"
                          />
                          <p> { name } </p>
                        </Box>
                      )
                    }
                  </Box>
                </Box>
              </Grid>
              <Grid xs={6} item>
                <Box style={{
                  background: 'gray',
                  padding: '1rem',
                  borderRadius: '4px',
                  visibility: indexOfSelectedNft === -1 && indexOfSelectedNftInWallet === -1 ? 'hidden' : 'visible',
                  height: '100px',
                  borderTop: '6px black solid',
                  borderBottom: '6px black solid',
                  borderRight: '6px black solid',
                  borderLeft: '6px black solid',
                  display: 'inline-block',
                  boxShadow: 'inset -4px -4px 0px 0px #292929',
                  boxSizing: 'content-box',
                  position: 'relative',
                }}>
                  {
                    indexOfSelectedNft > -1 && <>
                      <p style={{fontSize: '18px', fontWeight: 'bold'}}>
                        { nftsStaked[indexOfSelectedNft].name }
                      </p>
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <Button
                            variant='contained' 
                            color="primary" 
                            classes={{
                              root: classes.stakeButtons,
                            }}
                            onClick={unStake}
                          >
                            Unstake
                          </Button>
                          <Button
                            variant='contained'
                            color="primary"
                            onClick={claim}
                          >
                            Claim
                          </Button>
                        </div>
                        <p style={{maxWidth: '50%'}}>Claimable: { reward / 1e18 } Cat Coins</p>
                      </Box>
                    </>
                  }
                  {
                    indexOfSelectedNftInWallet > -1 && <>
                     <p style={{fontSize: '18px', fontWeight: 'bold'}}>
                        { nftsInWallet[indexOfSelectedNftInWallet].name }
                      </p>
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                        
                      }}>
                        <div>
                        <Button
                            variant='contained' 
                            color="primary" 
                            onClick={approve}
                            classes={{
                              root: classes.stakeButtons,
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant='contained' 
                            color="primary" 
                            classes={{
                              root: classes.stakeButtons,
                            }}
                            onClick={stake}
                          >
                            Stake
                          </Button>
                        </div>
                      </Box>
                    </>
                  }
                </Box>
                <Box style={{
                  background: 'gray',
                  minHeight: '300px',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginTop: '2rem',
                  borderTop: '6px black solid',
                  borderBottom: '6px black solid',
                  borderRight: '6px black solid',
                  borderLeft: '6px black solid',
                  boxShadow: 'inset -4px -4px 0px 0px #292929',
                  boxSizing: 'content-box',
                  position: 'relative',
                }}>
                  <p>
                    { nftsStaked.length } NFT(s) staked
                  </p>
                  <Box style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}>
                    {
                      nftsStaked.map(({image, name}, index) => 
                        <Box style={{
                          marginRight: '1rem',
                        }}>
                          <img 
                            src={image}
                            width="150"
                            style={{
                              border: index === indexOfSelectedNft ? '2px solid blue' : '',
                              width: '150px',
                              height: '150px',
                            }}
                            onClick={() => selectNftStaked(index)}
                            alt="NFT"
                          />
                          <p> { name } </p>
                        </Box>
                      )
                    }
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </div>

          {/* {!!account ? (
            <Container maxWidth="lg">
              <h2 style={{ textAlign: 'center', fontSize: '80px' }}>NFT Staking</h2>

              <Box mt={5}>
                <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 2).length === 0}>
                  <Typography color="textPrimary" variant="h4" gutterBottom>
                    MvSHARE Rewards Pools
                  </Typography>

                  <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    {activeBanks
                      .filter((bank) => bank.sectionInUI === 2)
                      .map((bank) => (
                        <React.Fragment key={bank.name}>
                          <CemeteryCard bank={bank} />
                        </React.Fragment>
                      ))}
                  </Grid>
                </div>

                <div hidden={activeBanks.filter((bank) => bank.sectionInUI === 0).length === 0}>
                  <Typography color="textPrimary" variant="h4" gutterBottom style={{ marginTop: '20px' }}>
                    Genesis Pools
                  </Typography>
                  <Alert variant="filled" severity="warning">
                    Genesis Pools start soon.
                  </Alert>
                  <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    {activeBanks
                      .filter((bank) => bank.sectionInUI === 0)
                      .map((bank) => (
                        <React.Fragment key={bank.name}>
                          <CemeteryCard bank={bank} />
                        </React.Fragment>
                      ))}
                  </Grid>
                </div>
              </Box>
            </Container>
          ) : (
            <UnlockWallet />
          )} */}
        </Route>
        <Route path={`${path}/:bankId`}>
          <BackgroundImage />
          <Bank />
        </Route>
      </Page>
    </Switch>
  );
};

export default Cryptoman;
