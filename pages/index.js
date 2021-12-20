import React, { Component } from 'react';
import {
    Statistic, Divider, Grid, Table, Message, Rating, Icon, Button,
    Menu, Container, Segment, Modal
} from 'semantic-ui-react';

import factory from '../ethereum/factory';
import Question from '../ethereum/question';
import Layout from '../components/Layout';
import moment from 'moment';
import web3 from '../ethereum/web3';
// import ETLNFT from '../ethereum/ETLNFT'
import EtherlearnNFT from '../ethereum/EtherlearnNFT';
import { search } from '../utils/search';
import * as data from '../config.json'
import { Link, Router } from '../routes';

const { categories } = data;
const textToImage = require('text-to-image');

class QuestionIndex extends Component {
    state = {
        loadingShareToken: false,
        loadingReturnDeposit: false,
        loadingClaimNFT: false,
        disabledShareToken: false,
        disabledReturnDeposit: false,
        disabledClaimNFT: false,
        didShareToken: false,
        nftInfo: false,
        currentIndex: 0,
        currentIndexDep: 0,
        currentIndexNFT: 0,
        activeCategory: categories[0],
        availableQuestions: [],
        titles: [],
        deposit: [],
        files: [],
        nft: {},
        timeEnd: [],
        answererList: [],
        questionRating: [],
        isOverDue: [],
        shareToken: [],
        numAnswer4: [],
        deployedAsking: [],
        deployedQuery: [],
        deployedDiscussion: []
    }

    static async getInitialProps({ req, query }) {
        let deployedQuestions = await factory.methods.getDeployedQuestions().call();
        deployedQuestions = [...deployedQuestions]
        deployedQuestions = deployedQuestions.reverse();

        //let chosenQuestions;
        console.log(query.value);
        let deployedCat1 = [];
        let deployedCat2 = [];
        let deployedCat3 = [];
        let deployedCat4 = [];
        let deployedCat5 = [];
        let deployed = [];
        let searchOrNot = false;
        let searchItem;
        let dataUriDict = {};
        //filter the questions based on search value
        if (query.value != undefined && query.value != 'favicon.ico') {
            searchItem = decodeURIComponent(query.value.substring(7));
            deployedQuestions = await search(searchItem, deployedQuestions);
        }

        

        await Promise.all(
            deployedQuestions.map(async (item) => {
                const itemCat = await Question(item).methods.getCategory().call();
                const summary = await Question(item).methods.getSummary().call();
                console.log(itemCat);                
                textToImage.generate(summary[1]).then(function(dataUri) {
                    dataUriDict[item] = dataUri;
                })
                
                switch (itemCat) {
                    case categories[0]: {
                        deployedCat1.push(item);
                        break;
                    }
                    case categories[1]: {
                        deployedCat2.push(item);
                        break;
                    }
                    case categories[2]: {
                        deployedCat3.push(item);
                        break;
                    }
                    case categories[3]: {
                        deployedCat4.push(item);
                        break;
                    }
                    case categories[4]: {
                        if (item !== "0x25143A56Db87300622a1c6479b178069E32551BF") {
                            deployedCat5.push(item);
                            break;
                        }
                        
                    }
                }
                console.log("deployedCat1: ", deployedCat1);
                console.log("deployedCat2: ", deployedCat2);
                console.log("deployedCat3: ", deployedCat3);
                console.log("deployedCat4: ", deployedCat4);
                console.log("deployedCat5: ", deployedCat5);   
            }))
        return { deployedCat1, deployedCat2, deployedCat3, deployedCat4, deployedCat5, searchItem, dataUriDict };
    }

    componentDidMount = async () => {
        // const deployedQuestions = await factory.methods.getDeployedQuestions().call();
        // deployedQuestions.reverse();

        // let {deployedAsking, deployedQuery, deployedDiscussion} = this.state;

        // console.log("deployedQuestions: ", deployedQuestions);

        // await Promise.all(
        //     deployedQuestions.map(async (item) => {
        //         const itemCat = await Question(item).methods.getCategory().call();
        //         console.log(itemCat);
        //         switch (itemCat) {
        //             case "Asking":   {
        //                 deployedAsking.push(item);
        //                 break;
        //             }   
        //             case "Query": {
        //                 deployedQuery.push(item);
        //                 break;
        //             }   
        //             case "Discussion":  {
        //                 deployedDiscussion.push(item);
        //                 break;
        //             }   
        //         }
        //         console.log("deployedAsking: ", deployedAsking);
        //         console.log("deployedQuery: ", deployedQuery);
        //         console.log("deployedDiscussion: ", deployedDiscussion);
        //     }));

        // await this.setState({
        //     deployedAsking: deployedAsking,
        //     deployedQuery: deployedQuery,
        //     deployedDiscussion: deployedDiscussion
        // });

        await this.renderData(categories[0]);

        console.log("componentDidMount");
    }

    componentDidUpdate = async (prevProps) => {
        if (prevProps.searchItem != this.props.searchItem) {
            await this.renderData(this.state.activeCategory);
            console.log("componentDidUpdate");
        }
    }

    dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
    
        //Old Code
        //write the ArrayBuffer to a blob, and you're done
        //var bb = new BlobBuilder();
        //bb.append(ab);
        //return bb.getBlob(mimeString);
    
        //New Code
        return new Blob([ab], {type: mimeString});
    
    }

    upload = async (blob, userAddress) => {
        try {
            // pinningMetadata = true;
            const serverUrl = "http://34.200.118.178:8080";

            const data = new FormData();
            data.append("image", blob)
            data.append("creator", userAddress);

            const response = await fetch(`${serverUrl}/mint`, {
                method: "POST",
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                body: data
            });
            if (response) {
                const data = await response.json();
                if (data.status === true &&
                    data.msg.metadataHash && 
                    data.msg.imageHash) {
                        // pinningMetadata = false;
                        // mintingToken = true;

                        var etlnft = EtherlearnNFT("0xBc6e06B22A7d1ce4bED705eeaCEe8B356944997E"); // "0x122F846Ee5611120e3F71E54Ed159c894C89e4a8"
                        
                        try {
                            await etlnft.methods.claimItem(`https://ipfs.io/ipfs/${data.msg.metadataHash}`).send({from: userAddress});
                        } catch (e) {
                            console.log(e);
                        }                                                
                        console.log('passed')
                    
            }   else {
                throw data.msg;
                }
            }   else {
                throw "No response";
            }
        } catch (error) {
            console.log(error);
        } finally {
            // pinningMetadata = false;
            // mintingToken = false;
            console.log("yay")
        }
    }
    


    renderData = async (category) => {
        const accounts = await web3.eth.getAccounts();

        const { deployedCat1, deployedCat2, deployedCat3, deployedCat4, deployedCat5, dataUriDict} = this.props;
        // for (var key in dataUriDict) {
        //     console.log(dataUriDict[key]);
        // }
        // console.log("dataUriDict", dataUriDict)
        console.log("dataUriDict len", Object.keys(dataUriDict).length)
        console.log("deployedCat1: ", deployedCat1);
        console.log("deployedCat2: ", deployedCat2);
        console.log("deployedCat3: ", deployedCat3);
        console.log("deployedCat4: ", deployedCat4);
        console.log("deployedCat5: ", deployedCat5);
        console.log("have deployed cat")

        let availableQuestions = [];

        switch (category) {
            case categories[0]: {
                availableQuestions = deployedCat1;
                break;
            }
            case categories[1]: {
                availableQuestions = deployedCat2;
                break;
            }
            case categories[2]: {
                availableQuestions = deployedCat3;
                break;
            }
            case categories[3]: {
                availableQuestions = deployedCat4;
                break;
            }
            case categories[4]: {
                availableQuestions = deployedCat5;
                break;
            }
        }
        console.log("availableQuestions: ", availableQuestions);



        let titles = [];
        let deposit = [];
        let owners = [];
        let files = [];
        let address = null;

        const summary = await Promise.all(
            availableQuestions
                .map((address) => {
                    return Question(address).methods.getSummary().call();
                })
        );

        summary.forEach(function (item) {
            titles.push(item[0]);
            deposit.push(item[2] / 10**2);
            owners.push(item[4]);
            files.push([item[5],item[6],item[1]])
        });


        const isOverDue = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.isOverdue().call();
            })
        );

        const timeArray = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getTime().call();
            })
        );

        const timeEnd = timeArray.map((time) => { return moment.unix(parseInt(time[0]) + parseInt(time[2])).format('dddd, Do MMMM YYYY, h:mm:ss a') });

        const answererList = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getAnswerList().call();
            })
        );

        const claimNFT = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getCheckClaimNFT().call();
            })
        )

        const shareToken = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getCheckShareToken().call();
            })
        )

        const returnDeposit = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getCheckReturnDeposit().call();
            })
        )

        const numAnswer4 = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getNumAnswer4().call();
            })
        )

        const questionRating = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getRatingQuestion().call();
            })
        );

        this.setState({
            availableQuestions: availableQuestions,
            titles: titles,
            deposit: deposit,
            owners: owners,
            files: files,
            timeEnd: timeEnd,
            answererList: answererList,
            questionRating: questionRating,
            isOverDue: isOverDue,
            claimNFT: claimNFT,
            shareToken: shareToken,
            returnDeposit: returnDeposit,
            numAnswer4: numAnswer4,
            address:accounts[0]
        });
    }

    returnDeposit = async (event, address, index) => {
        event.preventDefault();

        this.setState({ loadingReturnDeposit: true, currentIndexDep: index });
        const accounts = await web3.eth.getAccounts();
        await factory.methods.returnDepositAt(address).send({
            from: accounts[0],
        });

        this.setState({
            loadingReturnDeposit: false,
            disabledReturnDeposit: true
        });
        console.log("Return deposit!!!");
    }

    shareToken = async (event, address, index) => {
        event.preventDefault();

        this.setState({ loadingShareToken: true, currentIndex: index });
        const accounts = await web3.eth.getAccounts();
        await factory.methods.shareTokenAt(address).send({
            from: accounts[0],
        });

        this.setState({
            loadingShareToken: false,
            disabledShareToken: true
        });

        console.log("Share!!!");
    }

    claimNFT = async (event, address, index) => {
        event.preventDefault();

        this.setState({ loadingClaimNFT: true, currentIndexNFT: index });
        const accounts = await web3.eth.getAccounts();
        await factory.methods.claimNFTAt(address).send({
            from: accounts[0],
        });
        const { deployedCat1, deployedCat2, deployedCat3, deployedCat4, deployedCat5, dataUriDict } = this.props;

        let nft = {};
        nft[accounts[0]] = dataUriDict[address];

        let blob = this.dataURItoBlob(dataUriDict[address]);
        this.upload(blob, accounts[0]);

        this.setState({nft: nft, nftInfo: true});

        this.setState({
            loadingClaimNFT: false,
            disabledClaimNFT: true
        });

        console.log("Claimed NFT!!!");
    }

    handleCategoryClick = async (e, { name }) => {
        await this.setState({
            activeCategory: name
        });
        const { activeCategory } = this.state;
        this.renderData(activeCategory);
        console.log("End handleCategoryClick");
    }

    nftInfo() {
        return(
        <Modal
        size="tiny"
        open={this.state.nftInfo}
        onClose={() => this.setState({ nftInfo: false })}
        style={{textAlign: 'center'}}
    >
        <Modal.Header>Claimed! Your NFT token is being minted. Connect your Metamask wallet to https://testnets.opensea.io/ and check OpenSea some time later.</Modal.Header>
            </Modal>
        )
    }

    renderQuestionsDesktop() {
        const { activeCategory } = this.state;
        const items = this.state.availableQuestions.map((address, i) => {
            const owner = this.state.owners[i];
            const isOwner = (owner == this.state.address);
            const deposit = this.state.deposit[i]; //ethers.utils.formatUnits(this.state.deposit[i], "ether")*1000000000000000000;
            // const dataUriDict = this.state.dataUriDict;
            // console.log(dataUriDict)
            const nft = this.state.nft;
            console.log(nft)
            const rating = this.state.questionRating[i];
            const answers = this.state.answererList[i];
            const isOverDue = this.state.isOverDue[i];
            const canClaimNFT = this.state.claimNFT[i];
            const canShareToken = this.state.shareToken[i];
            const canReturnDeposit = this.state.returnDeposit[i];
            const timeEnd = this.state.timeEnd[i];
            const numAnswer4 = this.state.numAnswer4[i];
            console.log(canShareToken);
            return <Table.Row key={i}>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span
                            style={{ fontSize: 15, color: '#6A737C' }}><Rating icon='star' size='huge'
                                rating={rating}
                                maxRating={5} disabled />
                        </span></Statistic.Value>
                        <Statistic.Label><span style={{ fontSize: 15, color: '#6A737C' }}>votes</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span style={{ fontSize: 15, color: '#6A737C' }}>{answers.length}</span></Statistic.Value>
                        <Statistic.Label><span style={{ fontSize: 15, color: '#6A737C' }}>answers</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span style={{ fontSize: 15, color: '#6A737C' }}>{deposit}</span></Statistic.Value>
                        <Statistic.Label><span style={{ fontSize: 15, color: '#6A737C' }}>ETLToken</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='left'>
                    <Grid.Row textAlign='left'>
                        {/* <span style={{ fontSize: 18, color: '#6A737C', cursor: 'pointer'}} onClick={() => Router.pushRoute(`/questions/${address}`)}><a>{this.state.titles[i]}</a></span> */}
                        <span style={{ fontSize: 18, color: '#6A737C', cursor: 'pointer'}} onClick={() => window.open(`/questions/${address}`, "_blank")}><a>{this.state.titles[i]}</a></span>
                        
                    </Grid.Row>
                    {isOverDue ? 
                        ((canShareToken) ? ((numAnswer4) ? isOwner ? canClaimNFT ?
                            <Grid.Row textAlign='right'>
                                <Button positive onClick={(e) => this.shareToken(e, address, i)} loading={this.state.loadingShareToken && (this.state.currentIndex == i)} disabled={this.state.disabledShareToken}>
                                    Share Tokens!
                                </Button>
                                <Button positive onClick={(e) => this.claimNFT(e, address, i)} loading={this.state.loadingClaimNFT && (this.state.currentIndexNFT == i)} disabled={this.state.disabledClaimNFT}>
                                    Claim NFT!
                                </Button> 
                                <Message color='red' compact size='mini'
                                    header={'End time: ' + timeEnd}
                                />
                            </Grid.Row>: <Grid.Row textAlign='right'>
                                <Button positive onClick={(e) => this.shareToken(e, address, i)} loading={this.state.loadingShareToken && (this.state.currentIndex == i)} disabled={this.state.disabledShareToken}>
                                    Share Tokens!
                                </Button>
                                <Message color='red' compact size='mini'
                                    header={'End time: ' + timeEnd}
                                />
                            </Grid.Row> : <Grid.Row textAlign='right'><span> Question expired. Tokens Shared!<Icon name='check' color='green' /></span></Grid.Row> : ((canReturnDeposit) ? isOwner ?<Grid.Row textAlign='right'><Button positive onClick={(e) => this.returnDeposit(e, address, i)} loading={this.state.loadingReturnDeposit && (this.state.currentIndexDep == i)} disabled={this.state.disabledReturnDeposit}>
                                    Return Deposit!
                                </Button> 
                                <Message color='red' compact size='mini'
                                    header={'End time: '+timeEnd}
                                />
                        </Grid.Row>: <Grid.Row textAlign='right'><span> Question expired. Deposit Returned!<Icon name='check' color='green' /></span></Grid.Row> : <Grid.Row textAlign='right'><span> Question expired. Deposit Returned!<Icon name='check' color='green' /></span></Grid.Row>)) :  <Grid.Row textAlign='right'><span> Question expired. Tokens Shared!<Icon name='check' color='green' /></span></Grid.Row>) : 
                        <Grid.Row textAlign='right'>
                            <Message color='yellow' compact size='mini'
                                header={'End time: ' + timeEnd}
                            />
                        </Grid.Row>}
                </Table.Cell>
            </Table.Row>

        });

        return (
            <Container>
                <Menu tabular color={'green'}>
                    <Menu.Item name={`${categories[0]}`} active={activeCategory === categories[0]}
                        style={{ fontSize: "18px" }}
                        onClick={this.handleCategoryClick} />
                    <Menu.Item name={`${categories[1]}`} active={activeCategory === categories[1]}
                        style={{ fontSize: "18px" }}
                        onClick={this.handleCategoryClick} />
                    <Menu.Item name={`${categories[2]}`} active={activeCategory === categories[2]}
                        style={{ fontSize: "18px" }}
                        onClick={this.handleCategoryClick} />
                    <Menu.Item name={`${categories[3]}`} active={activeCategory === categories[3]}
                        style={{ fontSize: "18px" }}
                        onClick={this.handleCategoryClick} />
                    <Menu.Item name={`${categories[4]}`} active={activeCategory === categories[4]}
                        style={{ fontSize: "18px" }}
                        onClick={this.handleCategoryClick} />
                </Menu>
                <Table>
                    <Table.Body>
                        {items}
                    </Table.Body>
                </Table>
            </Container>
        )
    }

    render() {
        const itemsLength = this.state.availableQuestions ? this.state.availableQuestions.length : 0;
        console.log("render() ");
        return (
            <Layout searchItem={this.props.searchItem} >

                <h2>Questions</h2>
                <Divider hidden />

                {this.renderQuestionsDesktop()}

                <Divider hidden />
                <div style={{ marginTop: 20 }}>Found {itemsLength} Item(s).</div>
                <Divider hidden />

                {this.nftInfo()}
            </Layout>
        );
    }

}


export default QuestionIndex;

