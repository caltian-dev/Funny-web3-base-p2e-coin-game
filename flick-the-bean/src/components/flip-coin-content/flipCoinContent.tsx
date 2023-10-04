import { GetNonce, gameReveal } from "@/api/game";
import GetCookie from "@/hooks/cookies/getCookie";
import SetCookie from "@/hooks/cookies/setCookie";
import { enqueueSnackbar } from "notistack";
import { FC, useEffect, useState } from "react";
import AddFundModal from "../add-fund-modal/addFundModal";
import { getLeatherSignature } from "../play-modal/leather";
import { signMessage } from "../play-modal/unisat";
import { getXverseSign } from "../play-modal/xverse";
import RecentFlickersModal from "../recent-flickers-modal/recentFlickersModal";
import {
	useBalanceStore,
} from '../../store'
interface FlipCoinContentProps {
}

const FlipCoinContent:FC<FlipCoinContentProps> = ({  }) => {
  const[showRecentModal, setShowRecentModal] = useState(false);
  const[showAddFundModal, setShowAddFundModal] = useState(false);
	const[gameResult, setGameResult] = useState(0);
	const[acd, setAcd] = useState(0.1);
	const[loading, setLoading] = useState(false);
	const[balance, setBalance] = useState(0);
	const[startAnimation, setStartAnimation] = useState('coin_start.gif');
	const updateBalance = useBalanceStore(state => state.updateBalance);

	useEffect(() => {
		if(loading) {
			setTimeout(() => {
				setStartAnimation('coin_loop.gif')
			}, 100);
		} else {
			setStartAnimation('coin_start.gif')
		}

		const currentBalance = GetCookie('balance');
		if (currentBalance != '') {
			setBalance(Math.round((parseFloat(currentBalance) + Number.EPSILON) * 100) / 100);
		}
	}, [loading])

	useEffect(() => {
		updateBalance(balance)
	}, [balance])

  const handleAddFundModal = () => {
    setShowAddFundModal(!showAddFundModal);
  }

  const handleRecentModal = () => {
    setShowRecentModal(!showRecentModal);
  }

	const handleAcd = (val: number) => {
    setAcd(val);
		setGameResult(0);
  }

	const startGame = async (choice: boolean) => {
		setGameResult(0);
		setLoading(true);
		let {commitment, gameNonce}  = await GetNonce();
		SetCookie('commitment', commitment);
		SetCookie('gameNonce', gameNonce);
		const wallet = GetCookie('wallet');
		const winRandom = Math.floor(Math.random() * (4 - 1 + 1) + 1);
		const lostRandom = Math.floor(Math.random() * (9 - 5 + 1) + 5);

		if (wallet == 'xverse') {
			const { publicKey, signature } = await getXverseSign(gameNonce);
			if (publicKey != '' && signature != '') {
				const { gameResponse, newBalance } = await gameReveal(gameNonce, choice, acd, publicKey, signature);
				if (gameResponse != undefined && newBalance != '0.00') {
					setTimeout(() => {
						setStartAnimation(`coin_${gameResponse ? winRandom : lostRandom}.gif`);
						setBalance(Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100);
					}, 1000);
					setTimeout(() => {
						setLoading(false);
						setGameResult(gameResponse ? 1 : 2);
					}, 3600);
					SetCookie('balance', newBalance);
				} else {
					setLoading(false);
					setGameResult(0);
					enqueueSnackbar('Balance too low', {variant: 'error', anchorOrigin: {horizontal: 'left', vertical: 'top'}})
				}
			} else {
				setLoading(false);
			}
		} else if(wallet == 'unisat') {
			const { publicKey, signature } = await signMessage(gameNonce)

			if (publicKey != '' && signature != '') {
				const { gameResponse, newBalance } = await gameReveal(gameNonce, choice, acd, publicKey, signature);
				if (gameResponse != undefined && newBalance != '0.00') {
					setTimeout(() => {
						setStartAnimation(`coin_${gameResponse ? winRandom : lostRandom}.gif`);
						setBalance(Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100);
					}, 1000);
					setTimeout(() => {
						setLoading(false);
						setGameResult(gameResponse ? 1 : 2);
					}, 3600);
					SetCookie('balance', newBalance);
				} else {
					setLoading(false);
					setGameResult(0);
					enqueueSnackbar('Balance too low', {variant: 'error', anchorOrigin: {horizontal: 'left', vertical: 'top'}})
				}
			} else {
				setLoading(false);
			}
		} else if(wallet ==  'leather') {
			const { publicKey, signature } = await getLeatherSignature(gameNonce);

			if (publicKey != '' && signature != '') {
				const { gameResponse, newBalance } = await gameReveal(gameNonce, choice, acd, publicKey, signature);
				if (gameResponse != undefined && newBalance != '0.00') {
					setTimeout(() => {
						setStartAnimation(`coin_${gameResponse ? winRandom : lostRandom}.gif`);
						setBalance(Math.round((parseFloat(newBalance) + Number.EPSILON) * 100) / 100);
					}, 1000);
					setTimeout(() => {
						setLoading(false);
						setGameResult(gameResponse ? 1 : 2);
					}, 3600);
					SetCookie('balance', newBalance);
				} else {
					setLoading(false);
					setGameResult(0);
					enqueueSnackbar('Balance too low', {variant: 'error', anchorOrigin: {horizontal: 'left', vertical: 'top'}})
				}
			} else {
				setLoading(false);
			}
		}
	}

  return(
    <>
      <div>
					<p className="secondary-heading text-center m-0 mb-10">Flip Responsibly!</p>
					<h1 className="heading-primary">
						#1 PLACE TO <br /><span className="heading-primary__thick">BEAN</span> FLICK AND
						<span className="heading-primary__thick">COIN</span> FLIP
					</h1>
				</div>
				<section className="btns-wrapper">
					{/* <button className="btn-outline btn-outline--big mb-20">Switch to 2x mode</button> */}
					<div className="result mb-20 h-100">
						{
							loading && (
								// <video className="coin-flip-animation" src="/video/coin-animation.mp4" controls={false} autoPlay loop />
								<img className="coin-start-animation" src={`/static/animations/${startAnimation}`} alt="" />
							)
						}
						{
							gameResult == 1 ? (
								<>
									{/* <img className="coin-start-animation" src={`/static/animations/${startAnimation}`} alt="" /> */}
									<h2 className="result__title">CONGRATULATIONS <br />YOU WON!</h2>
									<div className="result__subtitle text-success">+{acd} ACD3</div>
								</>
							) : gameResult == 2 ? (
								<>
									{/* <img className="coin-start-animation" src={`/static/animations/${startAnimation}`} alt="" /> */}
									<h2 className="result__title">YOU LOST</h2>
									<div className="result__subtitle text-alert">-{acd} ACD3</div>
								</>
							) : (<></>)
						}
					</div>

					{/* <div className="result mb-20 h-100">
						<h2 className="result__title">YOU LOST</h2>
						<div className="result__subtitle text-alert">-0.25 ACD3</div>
					</div> */}
					<div className="btns-inner-wrapper">
						<div className="score-area">
							<div className="score-area__text">Token used <span className="fw-bold">ACD3</span></div>
							<div className="score-area__text">Total balance: {balance} ACD3</div>
						</div>
						<div className="btns-row mt-30">
							<button className="btn-white" id="head-btn" disabled={loading} onClick={() => startGame(true)}>
								<img className="btn-white__avatar" src="/static/img/head.png" alt="head icon" />
								<span className="btn-white__text">Flip Heads</span>
							</button>
							<button className="btn-white btn-white--active" disabled={loading} onClick={() => startGame(false)}>
								<img className="btn-white__avatar" src="/static/img/tails.png" alt="tail icon" />
								<span className="btn-white__text">Flip Tails</span>
							</button>
						</div>
						<div className="btns-grid mt-30">
							<button disabled={loading} className={`btn-outline btn-outline--medium ${acd == 0.1 && 'btn-outline--medium-active' }`} onClick={() => handleAcd(0.1)}>
								0.1
							</button>
							<button disabled={loading} className={`btn-outline btn-outline--medium ${acd == 0.25 && 'btn-outline--medium-active' }`} onClick={() => handleAcd(0.25)}>0.25</button>
							<button disabled={loading} className={`btn-outline btn-outline--medium ${acd == 0.5 && 'btn-outline--medium-active' }`} onClick={() => handleAcd(0.5)}>0.5</button>
							<button disabled={loading} className={`btn-outline btn-outline--medium ${acd == 1 && 'btn-outline--medium-active' }`} onClick={() => handleAcd(1)}>1</button>
							<button disabled={loading} className={`btn-outline btn-outline--medium ${acd == 2 && 'btn-outline--medium-active' }`} onClick={() => handleAcd(2)}>2</button>
							<button disabled={loading} className={`btn-outline btn-outline--medium ${acd == 3 && 'btn-outline--medium-active' }`} onClick={() => handleAcd(3)}>3</button>
						</div>
						<div className="text-center mt-30">
							<p>
								3% fees apply for every flip. Refer to <span className="fw-bold">FAQ</span> for more
								information.
							</p>
						</div>
						<div className="btn-arrow-row">
							<button className="btn-arrow" onClick={handleRecentModal}>
								Recent Flickers
								<img className="btn-arrow__icon" src="static/svgs/arrow-right.svg" alt="arrow icon" />
							</button>
						</div>
					</div>
          <RecentFlickersModal show={showRecentModal} handleModal={handleRecentModal} />
          <AddFundModal show={showAddFundModal} handleModal={handleAddFundModal} />
				</section>
    </>
  )
}

export default FlipCoinContent;