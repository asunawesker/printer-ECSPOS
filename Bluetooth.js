import React, {Component} from 'react';
import {ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
    Button,
    ScrollView,
    DeviceEventEmitter,
    Switch,
    TouchableOpacity,
    Dimensions,
    ToastAndroid, 
    Modal,
    TouchableHighlight,
    Alert
} from 'react-native';
import {BluetoothEscposPrinter, BluetoothManager} from "react-native-bluetooth-escpos-printer";
import {Picker} from '@react-native-picker/picker';

var {height, width} = Dimensions.get('window');
export default class Bluetooth extends Component {


    _listeners = [];

    constructor() {
        super();
        this.state = {
            devices: null,
            pairedDs:[],
            foundDs: [],
            bleOpend: false,
            loading: true,
            boundAddress: '',
            debugMsg: '',
            modalVisible: false
        }
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
      }

    componentDidMount() {
        BluetoothManager.isBluetoothEnabled().then((enabled)=> {
            this.setState({
                bleOpend: Boolean(enabled),
                loading: false
            })
        }, (err)=> {
            err
        });
        if (Platform.OS === 'android') {
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, (rsp)=> {
                    this._deviceAlreadPaired(rsp)
                }));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND, (rsp)=> {
                    this._deviceFoundEvent(rsp)
                }));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_CONNECTION_LOST, ()=> {
                    this.setState({
                        name: '',
                        boundAddress: ''
                    });
                }
            ));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, ()=> {
                    ToastAndroid.show("Device Not Support Bluetooth !", ToastAndroid.LONG);
                }
            ))
        }
    }

    _deviceAlreadPaired(rsp) {
        var ds = null;
        if (typeof(rsp.devices) == 'object') {
            ds = rsp.devices;
        } else {
            try {
                ds = JSON.parse(rsp.devices);
            } catch (e) {
            }
        }
        if(ds && ds.length) {
            let pared = this.state.pairedDs;
            pared = pared.concat(ds||[]);
            this.setState({
                pairedDs:pared
            });
        }
    }

    _deviceFoundEvent(rsp) {//alert(JSON.stringify(rsp))
        var r = null;
        try {
            if (typeof(rsp.device) == "object") {
                r = rsp.device;
            } else {
                r = JSON.parse(rsp.device);
            }
        } catch (e) {
        }
        if (r) {
            let found = this.state.foundDs || [];
            if(found.findIndex) {
                let duplicated = found.findIndex(function (x) {
                    return x.address == r.address
                });
                if (duplicated == -1) {
                    found.push(r);
                    this.setState({
                        foundDs: found
                    });
                }
            }
        }
    }

    _renderRow(rows){    
        let items = [];
        for(let i in rows){
            let row = rows[i];
            if(row.address) {
                items.push(                    
                    <TouchableOpacity key={new Date().getTime()+i} style={styles.wtf} onPress={()=>{
                        this.setState({
                            loading:true
                        });
                        BluetoothManager.connect(row.address)
                            .then((s)=>{
                                this.setState({
                                    loading:false,
                                    boundAddress:row.address,
                                    name:row.name || "UNKNOWN"
                                })
                            },(e)=>{
                                this.setState({
                                    loading:false
                                })
                                alert(e);
                            })

                        }}
                    > 
                        <Text style={styles.name}>{row.name || "UNKNOWN"}</Text>
                    </TouchableOpacity>
                );                 
            }
        }
        return items;
    }

    _enabledDeviceBluetooth () {
        return(
            <View>
                <Switch value={this.state.bleOpend} onValueChange={(v)=>{
                    this.setState({
                        loading:true
                    })
                    if(!v){
                        BluetoothManager.disableBluetooth().then(()=>{
                            this.setState({
                                bleOpend:false,
                                loading:false,
                                foundDs:[],
                                pairedDs:[]
                            });
                        },(err)=>{alert(err)});
                    }else{
                        BluetoothManager.enableBluetooth().then((r)=>{
                            var paired = [];
                            if(r && r.length>0){
                                for(var i=0;i<r.length;i++){
                                    try{
                                        paired.push(JSON.parse(r[i]));
                                    }catch(e){
                                        //ignore
                                    }
                                }
                            }
                            this.setState({
                                bleOpend:true,
                                loading:false,
                                pairedDs:paired
                            })
                        },(err)=>{
                            this.setState({
                                loading:false
                            })
                            alert(err)
                        });
                    }
                }}/>                    
            </View>
        );
    }

    _showDeviceBluetooth() {
        return (
            <>
                <Text  style={styles.title}>Dispositivos emparejados:</Text>
                
                {this.state.loading ? (<ActivityIndicator animating={true}/>) : null}
                    
                <View style={{flex:1, flexDirection:"column", marginHorizontal: 35}}>
                {
                    this._renderRow(this.state.pairedDs)
                }                
                </View>
            </>
        );
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                
                <Text style={styles.title}>Bluetooth activado: {this.state.bleOpend?"Si":"No"} </Text>

                {/* Modal enseña bluetooth */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>

                        <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={() => {
                                this._scan();
                                this.setModalVisible(!this.state.modalVisible);
                            }}
                        >                   
                        <Text>Scannear dispositivos</Text>                                 
                        </TouchableHighlight>                       

                        <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={() => {
                                this.setModalVisible(!this.state.modalVisible);
                            }}
                        >
                            <Text>Cerrar modal</Text>
                        </TouchableHighlight>
                        </View>
                    </View>
                </Modal>

                {
                        this._enabledDeviceBluetooth()
                }
                
                {/* Enseñar modal*/}
                <TouchableHighlight
                    style={styles.openButton}
                    onPress={() => {
                        this.setModalVisible(true);
                    }}
                    >
                    <Text style={styles.textStyle}>Show Modal</Text>
                </TouchableHighlight>               
                
                <Text  style={styles.title}>Conectado: 
                    <Text style={{color:"blue"}}>{!this.state.name ? ' Dispositivo no conectado ' : this.state.name}</Text>
                </Text>

                {this.state.loading ? (<ActivityIndicator animating={true}/>) : null}

                <View style={{flex:1,flexDirection:"column"}}>
                    {
                        this._renderRow(this.state.foundDs)
                    }                
                </View>
                
                {
                            this._showDeviceBluetooth()
                        } 
                

            </ScrollView>
        );
    }

    _selfTest() {
        this.setState({
            loading: true
        }, ()=> {
            BluetoothEscposPrinter.selfTest(()=> {
            });

            this.setState({
                loading: false
            })
        })
    }

    _scan() {
        this.setState({
            loading: true
        })
        BluetoothManager.scanDevices()
            .then((s)=> {
                var ss = s;
                var found = ss.found;
                try {
                    found = JSON.parse(found);//@FIX_it: the parse action too weired..
                } catch (e) {
                    //ignore
                }
                var fds =  this.state.foundDs;
                if(found && found.length){
                    fds = found;
                }
                this.setState({
                    foundDs:fds,
                    loading: false
                });
            }, (er)=> {
                this.setState({
                    loading: false
                })
                alert('error' + JSON.stringify(er));
            });
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },

    title:{
        width:width,
        color:"#232323",
        paddingLeft: 25,
        paddingVertical:4,
        textAlign:"left"
    },
    wtf:{
        flex:1,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },
    name:{
        flex:1,
        textAlign:"left"
    },
    address:{
        flex:1,
        textAlign:"right"
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      },
      openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
      },
      textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
      },
      modalText: {
        marginBottom: 15,
        textAlign: "center"
      }
});