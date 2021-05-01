import React, { Component } from 'react'
import Web3 from 'web3'
// import './App.css'
import {CHAINY_ADDRESS,CHAINY_ABI} from './config'
import SHA256 from 'crypto-js/sha256'
import encHex from 'crypto-js/enc-hex'
// import encLatin1 from 'crypto-js/enc-latin1'



class App extends Component {

  async componentDidMount() {
    // Detect Metamask
    const metamaskInstalled = typeof web3 !== 'undefined'
    this.setState({ metamaskInstalled })
    if(metamaskInstalled) {
      await this.loadBlockchain()
    }
  }
  async loadBlockchain() {
    let web3;
    if (window.ethereum) {
      web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      console.log('check ethereum.enable');
    }
    else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider)
    }
    else {
      // DO NOTHING...
    }

    web3.eth.getAccounts(console.log);
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})

    const chainy = new web3.eth.Contract(CHAINY_ABI,CHAINY_ADDRESS)
    this.setState({chainy})
    // console.log("chainy",chainy)

    var hash = SHA256("Message");
    console.log(hash.toString(encHex));
  }


  constructor(props) {
    super(props)
    this.state = {
      account: '',
      msg:'',
      msgsdr:'',
      msgtime:'',
      code:'',
      timestamp:'',
      transactionId:''
    }
    this.getData= this.getData.bind(this)
    this.addData= this.addData.bind(this)
  }
  async getData(content){

    let msg =await this.state.chainy.methods.getChainyData(content).call()
    let msgsdr =await this.state.chainy.methods.getChainySender(content).call()
    let msgtime = await this.state.chainy.methods.getChainyTimestamp(content).call()

    msg='Data: '+msg
    msgsdr='Sender: '+msgsdr
    var a = new Date(msgtime * 1000)
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    msgtime = 'Timestamp: '+date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    
    this.setState({msg:msg,msgsdr:msgsdr,msgtime:msgtime})
    console.log('msg',msg,this.state.msg,msgsdr,msgtime)

    
  }

  async addData(content){

    const a =await this.state.chainy.methods.addChainyData(content).send({ from: this.state.account })
    // console.log('a_tranhash',a['transactionHash'])
    const transactionId = 'Transaction Id: '+a['transactionHash']
    const code = (a['events']['chainyShortLink']['returnValues']['code']).split('/')[3]
    const timestamp = a['events']['chainyShortLink']['returnValues']['timestamp']
    this.setState({transactionId:transactionId})
    this.setState({code:code})
    this.setState({timestamp:timestamp})
    // this.setState({code:a['events']['chainyShortLink']['returnValues']['code']})
    this.setState({timestamp:a['events']['chainyShortLink']['returnValues']['timestamp']})
    console.log('a',(a['events']['chainyShortLink']['returnValues']['code']).split('/')[3])
    console.log('a',a['events']['chainyShortLink']['returnValues']['timestamp'])
    
  }
    

  render() {
    
    return (
      <div className = "no">
        <h1>Proof of Existence</h1>
        <h6>Using Chainy contract (https://github.com/EverexIO/Chainy)</h6>

        <div className="container">
          <div className="item">
              <p>your account: {this.state.account}</p>
          </div>
          <div className="item">
            <InputForGetChainydata getData={this.getData} msg={this.state.msg} 
                    msgsdr={this.state.msgsdr} msgtime={this.state.msgtime}/>
          </div>

          <div className="item">
            <HashdataAndAddChainy addData={this.addData} code={this.state.code} transactionId={this.state.transactionId}/>
          </div>


        </div>
      </div>


      



    );
  }
}


class InputForGetChainydata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: '', msg:''};
    this.code=''

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    this.code=this.state.value
    event.preventDefault(); 
    this.setState({value:''});
    this.props.getData(this.code)
  }

  render() {
    let r_msg = this.props.msg;
    let r_msgsdr = this.props.msgsdr;
    let r_msgtime = this.props.msgtime;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Short code: 
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Get Data" />    
        </form>
        <div>
        <p>{r_msg}</p>
        <p>{r_msgsdr}</p>
        <p>{r_msgtime}</p>

        </div>
      </div>
    );
  }
}


class InputForAddChainydata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: '', msg:''};
    this.inputdata=''

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.props.onAddTextChange(event);
  }

  handleSubmit(event) {
    this.inputdata = this.props.jsontext.toString()
    console.log('inputdata',this.inputdata)
    event.preventDefault(); 
    this.setState({value:''});
    this.props.addData(this.inputdata)
  }

  render() {
    const jsontext = this.props.jsontext;
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
          JSON with hash msg:
          <textarea value={jsontext} onChange={this.handleChange} />
        </label>
          <input type="submit" value="Add Data" />    
        </form>
        <p>{this.props.code}</p>
        <p>{this.props.transactionId}</p>
      </div>

    );
  }
}


class HashdataAndAddChainy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {descriptionvalue:'',value: '', msg:'', jsontext:'', hashdata:''};
    this.hashdata=''
    this.fileInput = React.createRef();
    this.file = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileSubmit = this.handleFileSubmit.bind(this);
    this.onAddTextChange = this.onAddTextChange.bind(this);
    this.processFile = this.processFile.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleDescriptionChange(event){
    this.setState({descriptionvalue: event.target.value});
  }

  handleSubmit(event) {
    
    event.preventDefault(); 
    let hash = SHA256(this.state.value);  
    console.log('hash',hash);
    this.hashdata = hash.toString(encHex);
    console.log('qwerewrq',this.hashdata);
    let text;
    if(this.state.descriptionvalue!==''){
      text= '{"description":"'+this.state.descriptionvalue+'","hash":"'+this.hashdata+'"}';
    }
    else{
      text='{"hash":"'+this.hashdata+'"}';
    }
    console.log('text',text);
    this.setState({value:'',jsontext:text,descriptionvalue:''});

    console.log('qwerewrq',this.state.jsontext);
    
  }
  onAddTextChange(event){
    this.setState({jsontext: event.target.value});
    
  }
  
  async processFile(event) {

    const file = event.target.files[0]
    if (file) {
      // return this.processFileContent(await file.text())
      const data = await new Response(file).text()
      var text = data;
      // var text = encLatin1.parse(data);
      var hash = SHA256(text);
      this.hashdata = hash.toString(encHex);
      console.log('encHex',this.hashdata );
    }

  }
  

  handleFileSubmit(event) {
    event.preventDefault(); 
    let text;
    if(this.state.descriptionvalue!==''){
      text= '{"description":"'+this.state.descriptionvalue+'","hash":"'+this.hashdata+'"}';
    }
    else{
      text='{"hash":"'+this.hashdata+'"}';
    }
    console.log('text',text);
    this.setState({value:'',jsontext:text,descriptionvalue:''});

    
  }



  render() {
    return (

      <div>

          <InputForAddChainydata jsontext={this.state.jsontext} onAddTextChange={this.onAddTextChange}
            addData={this.props.addData} code={this.props.code} transactionId={this.props.transactionId}/>

          <p>
              Description:
              <input type="text" value={this.state.descriptionvalue} onChange={this.handleDescriptionChange} />
          </p>
          <form onSubmit={this.handleSubmit}>
            <label>
            Hash your text:
            <textarea value={this.state.value} onChange={this.handleChange} />
          </label>
            <input type="submit" value="Hash" />    
          </form>

          <form onSubmit={this.handleFileSubmit} >
            <label>
              Hash your file:
              <input type="file" ref={this.fileInput} id="fileUploader" onChange={this.processFile} encType="multipart/form-data"/>
            </label>
              <input type="submit" value="Hash" /> 

          </form>
 
        <p>{this.hashdata}</p>

      </div>
    );
  }
}


export default App;