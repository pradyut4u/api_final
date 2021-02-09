/*import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,Image} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'
import {BookSearch} from 'react-native-google-books';
import {SearchBar,ListItem} from 'react-native-elements'

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      IsBookRequestActive : "",
      requestedBookName: "",
      bookStatus:"",
      requestId:"",
      userDocId: '',
      docId :'',
      Imagelink: '',
      dataSource:"",
      showFlatlist: false
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }



  addRequest = async (bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    var books = await BookSearch.searchbook(bookName,'AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc')
    console.log("here in add request");
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status" : "requested",
         "date"       : firebase.firestore.FieldValue.serverTimestamp(),
         "image_link" : books.data[0].volumeInfo.imageLinks.smallThumbnail

    })

    await  this.getBookRequest()
    db.collection('users').where("email_id","==",userId).get()
    .then()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        db.collection('users').doc(doc.id).update({
      IsBookRequestActive: true
      })
    })
  })

    this.setState({
        bookName :'',
        reasonToRequest : '',
        requestId: randomRequestId
    })

    return Alert.alert("Book Requested Successfully")


  }

receivedBooks=(bookName)=>{
  var userId = this.state.userId
  var requestId = this.state.requestId
  db.collection('received_books').add({
      "user_id": userId,
      "book_name":bookName,
      "request_id"  : requestId,
      "bookStatus"  : "received",

  })
}




getIsBookRequestActive(){
  db.collection('users')
  .where('email_id','==',this.state.userId)
  .onSnapshot(querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        IsBookRequestActive:doc.data().IsBookRequestActive,
        userDocId : doc.id
      })
    })
  })
}










getBookRequest =()=>{
  // getting the requested book
var bookRequest=  db.collection('requested_books')
  .where('user_id','==',this.state.userId)
  .get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      if(doc.data().book_status !== "received"){
        this.setState({
          requestId : doc.data().request_id,
          requestedBookName: doc.data().book_name,
          bookStatus:doc.data().book_status,
          docId     : doc.id
        })
      }
    })
})}



sendNotification=()=>{
  //to get the first name and last name
  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      var name = doc.data().first_name
      var lastName = doc.data().last_name

      // to get the donor id and book nam
      db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc) => {
          var donorId  = doc.data().donor_id
          var bookName =  doc.data().book_name

          //targert user id is the donor id to send notification to the user
          db.collection('all_notifications').add({
            "targeted_user_id" : donorId,
            "message" : name +" " + lastName + " received the book " + bookName ,
            "notification_status" : "unread",
            "book_name" : bookName
          })
        })
      })
    })
  })
}

componentDidMount(){
  this.getBookRequest()
  this.getIsBookRequestActive()


}

updateBookRequestStatus=()=>{
  //updating the book status after receiving the book
  db.collection('requested_books').doc(this.state.docId)
  .update({
    book_status : 'received'
  })

  //getting the  doc id to update the users doc
  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc) => {
      //updating the doc
      db.collection('users').doc(doc.id).update({
        IsBookRequestActive: false
      })
    })
  })
}

async getBooksFromApi (bookName){
  this.setState({bookName:bookName})
    if (bookName.length >2){

    var books = await BookSearch.searchbook(bookName,'AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc')
    this.setState({
      dataSource:books.data,
      showFlatlist:true
    })

  // console.log("here is the book data volume " ,books.data[0].volumeInfo.title);
  // console.log("here is the book data volume " ,books.data[1].volumeInfo.title);
  // console.log("here is the book data volume " ,books.data[2].volumeInfo.title);
  // console.log("here is the book data volume " ,books.data[3].volumeInfo.title);
  // console.log("here is the book data volume " ,books.data[4].volumeInfo.title);
  // console.log("this is the self link ",books.data[0].selfLink);
  // console.log("thhis is the sale",books.data[0].saleInfo.buyLink);
  // this.setState({Imagelink:books.data[0].volumeInfo.imageLinks.smallThumbnail})
}
  }


//render Items  functionto render the books from api
 renderItem = ( {item, i} ) =>{
   console.log("image link ");

  let obj ={
    title:item.volumeInfo.title,
    selfLink: item.selfLink,
    buyLink: item.saleInfo.buyLink,
    imageLink:item.volumeInfo.imageLinks
  }


   return (
     <TouchableHighlight
     style={{ alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,

    width: '90%',
    }}
      activeOpacity={0.6}
      underlayColor="#DDDDDD"
      onPress={()=>{
        this.setState({
          showFlatlist:false,
          bookName:item.volumeInfo.title,

        })}
    }
      bottomDivider
      >
       <Text> {item.volumeInfo.title} </Text>

     </TouchableHighlight>


   )
 }

  render(){

    if(this.state.IsBookRequestActive === true){
      return(

        // Status screen

        <View style = {{flex:1,justifyContent:'center'}}>
          <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text>Book Name</Text>
          <Text>{this.state.requestedBookName}</Text>
          </View>
          <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text> Book Status </Text>

          <Text>{this.state.bookStatus}</Text>
          </View>

          <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
          onPress={()=>{
            this.sendNotification()
            this.updateBookRequestStatus();
            this.receivedBooks(this.state.requestedBookName)
          }}>
          <Text>I recieved the book </Text>
          </TouchableOpacity>
        </View>
      )
    }
    else
    {
    return(
      // Form screen
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>

          <View>

          <TextInput
            style ={styles.formTextInput}
            placeholder={"enter book name"}
            onChangeText={text => this.getBooksFromApi(text)}
            onClear={text => this.getBooksFromApi('')}
            value={this.state.bookName}
          />

      {  this.state.showFlatlist ?

        (  <FlatList
        data={this.state.dataSource}
        renderItem={this.renderItem}
        enableEmptySections={true}
        style={{ marginTop: 10 }}
        keyExtractor={(item, index) => index.toString()}
      /> )
      :(
        <View style={{alignItems:'center'}}>
        <TextInput
          style ={[styles.formTextInput,{height:300}]}
          multiline
          numberOfLines ={8}
          placeholder={"Why do you need the book"}
          onChangeText ={(text)=>{
              this.setState({
                  reasonToRequest:text
              })
          }}
          value ={this.state.reasonToRequest}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={()=>{ this.addRequest(this.state.bookName,this.state.reasonToRequest);
          }}
          >
          <Text>Request</Text>
        </TouchableOpacity>
        </View>
      )
    }
            </View>
        </View>
    )
  }
}
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)*/

import React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'
import {BookSearch} from 'react-native-google-books';
import { FlatList } from 'react-native-gesture-handler';

export default class BookRequestScreen extends React.Component{
	constructor(){
		super()
		this.state={
			userId:firebase.auth().currentUser.email,
			itemName: '',
			reason: '',
			requestId:'',
			docId:'',
			itemStatus:'',
			itemrequestactive:'',
			userDoc:'',
			dataSource:'',
			showFlatList:false,
			requestedItemName:''
		}
	}
	uniqueId(){
		return Math.random().toString(36).substring(7)
	}

	addRequest = async (itemName,reason) =>{
		var userId=this.state.userId
		var requestId=this.uniqueId()
		db.collection('requestedItems').add({
		userId:userId,itemName:itemName,reason:reason,requestId:requestId,itemStatus:"requested"})
		this.setState({
			itemName:'',
			reason:''
		})
		this.getItemRequest()
		db.collection("users").where("emailid","==",this.state.userId).get()
		.then(snapShot=>{
			snapShot.forEach(doc=>{
				db.collection("users").doc(doc.id).update({
					itemrequestactive:true
				})
			})
		})
		return(
			alert("Item requested Succesfully")
		)
	}

    getItemRequest = ()=>{
		db.collection('requestedItems').where("userId","==",this.state.userId).get()
		.then(snapShot=>{
			snapShot.forEach(doc=>{
				if(doc.data().itemStatus!=="recived"){
					this.setState({
						requestId:doc.data().requestId,
						itemStatus:doc.data().itemstatus,
						requesteditemName:doc.data().itemName,
						docId:doc.id
					})
				}

			})
		})
	}

	itemrequestactive = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				this.setState({
					itemrequestactive:doc.data().itemrequestactive,
					userDoc:doc.id
				})
			})
		})
	}

	updateItemRequestStaus = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				db.collection("users").doc(doc.id).update({
					itemrequestactive:false
				})
			})
		})
		db.collection("requestedItems").doc(this.state.docId).update({
			itemStatus:"recived"
		})
	}

	sendNotification = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				var name = doc.data().firstName+doc.data().lastName
				db.collection("allNotifications").where("reqestId","==",this.state.requestId).onSnapshot(snapShot=>{
					snapShot.forEach(doc=>{
						var donarId = doc.data().donarId
						var itemName = doc.data().itemName
						db.collection("allNotifications").add({
							targetUserId:donarId,itemName:itemName,notificationStatus:"unread",message:name+"recived"+itemName
						})
					})
				})
			})
		})
	}

	async getItemApi(itemName){
		this.setState({
			itemName:itemName
		})
		if(itemName){
		if(itemName.length > 2){
            var items = await BookSearch.searchbook(itemName,"AIzaSyDs5qH61LrIlsfhtdq7aTLfcegv2FZ2h3Y")
            this.setState({
				dataSource:items.data,
				showFlatList:true
			})
		}
		}
		else{
			console.log("no item name")
		}
	}

	renderItem = ({item,i})=>{
			let obj = {
				title:item.volumeInfo.title,selfLink:item.selfLink,buyLink:item.saleInfo.buyLink,imageLink:item.volumeInfo.imageLinks
			}
			return(
				<TouchableHighlight style={{backgroundColor:"red", padding:10, width:"80%"}}
				activeOpacity={0.5} underlayColor="orange" 
				onPress={()=>{
					this.setState({
						showFlatList:false,
						itemName:item.volumeInfo.title
					})
				}} 
				bottomDivider>
					<Text>{item.volumeInfo.title}</Text>
				</TouchableHighlight>
			)
		}

	componentDidMount(){
		this.itemrequestactive()
		this.getItemRequest()
	}

	render(){
		if(this.state.itemrequestactive === true){
			return(
				<View style={{flex:1, justifyContent:'center'}}>
					<View style={{borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10}}>
						<Text>Item Name</Text>
						<Text>{this.state.requestedItemName}</Text>
					</View>
					<View style={{borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10}}>
						<Text>Item Status</Text>
						<Text>{this.state.itemStatus}</Text>
					</View>
					<TouchableOpacity style={{
						borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10
						}}
						onPress={()=>{
							this.updateItemRequestStaus();
							this.sendNotification()
						}}>
						<Text>I recived the item</Text>
					</TouchableOpacity>
				</View>
			)
		}
		else{
		return(
			<View>
				<MyHeader title={"Request"} navigation={this.props.navigation}/>
			<KeyboardAvoidingView>
			<TextInput style={{marginTop:50}} placeholder="Item name" onChangeText={text=>this.getItemApi(text)} onClear={text=>this.getItemApi("")} value={this.state.itemName}/>
			{this.state.showFlatList?(
			<FlatList data={this.state.dataSource} 
				renderItem={this.renderItem} 
				style={{marginTop:20}} 
				keyExtractor={(item,index)=>index.toString()
				}></FlatList>):(
				
					<View>
			         <TextInput 
			           placeholder="Reason" 
			multiline numberOfLines={5}
			onChangeText={text=>{this.setState({reason:text})}} 
			value={this.state.reason}/>
			<TouchableOpacity onPress={()=>{this.addRequest(this.state.itemName,this.state.reason)}}>
			<Text>Request</Text>
			</TouchableOpacity>
			</View>)}
			</KeyboardAvoidingView>
			</View>
		)
		}
	}
}