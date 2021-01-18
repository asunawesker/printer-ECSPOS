import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Button, ScrollView, TextInput, } from 'react-native';

import useForm from './useForms';
import Bluetooth from './Bluetooth';
import {BluetoothEscposPrinter, BluetoothManager} from "react-native-bluetooth-escpos-printer";

const Entry =  () => {	
 
	const initialState = {
        issuedDate: '',
		type: '',
		color: '',
	}
	
	const entryVehicleLocal = async ({values}) => {

		const currentDay = new Date();
		const date = String(currentDay);
		const dateSlice = date.slice(4, -15);
        const issuedDate = String(dateSlice);
		values.issuedDate = issuedDate;
		
        const valuesLocal = {
			issuedDate: issuedDate,
			type: values.type,
			color: values.color
        }

		printCar(valuesLocal);
		
	}

	const printCar = async (carJSON) => {

        console.log(carJSON);  
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.setBlob(0);
        await  BluetoothEscposPrinter.printText(`Estacionamiento Rodriguez\n\r`,{
            encoding:'GBK',
            codepage:0,
            widthtimes:1.8,
            heigthtimes:1.8,
            fonttype:1
        });
        await BluetoothEscposPrinter.printText(`\n\r`,{});
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
        await BluetoothEscposPrinter.printText(`Tipo: ${carJSON.type}\n\r`,{});
        await BluetoothEscposPrinter.printText(`Color: ${carJSON.color}\n\r`,{});        
        await BluetoothEscposPrinter.printText(`\n\r`,{});
        await BluetoothEscposPrinter.printText(`Nota: Esta empresa no se hace responsable de `+
        `percances causados por incendios; por causas fortuitas y de fuerza mayor ni tampoco `+
        `por percances causados por otros usuarios ni por objetos dejados en el interior ni `+
        `por robo total del vehiculo o alguna de sus partes\n\r`,{
            encoding:'GBK',
            codepage:0,
            widthtimes:0,
            heigthtimes:0,
            fonttype:1
        });
        
	}
	
	const onSubmit = async (values) => {
		try {
			entryVehicleLocal({values});
		} catch (e) {
			console.log(e);
		}
	}

	const { subscribe, inputs, handleSubmit } = useForm(initialState, onSubmit);

	return (
	<View style = {styles.entrada}>
		<ScrollView>

            <Bluetooth/>

            <View style = {styles.viewDatos}>
                <Text style = {styles.label}>Tipo</Text>
                <TextInput 
                    placeholder  = 'Ingresa el tipo de automóvil'
                    style 		 = {styles.input}
                    value 		 = {inputs.type}
                    onChangeText = {subscribe('type')}
                />
            </View>

            <View style = {styles.viewDatos}>
                <Text style = {styles.label}>Color</Text>
                <TextInput 
                    placeholder  = 'Ingresa el color'
                    style 	 	 = {styles.input}
                    value 		 = {inputs.color}
                    onChangeText = {subscribe('color')}
                />
            </View>

            <View>
                <TouchableOpacity 
                    style   = {styles.btnEntrada} 
                    onPress = { async () => {
                        handleSubmit();                        
                    }}
                >
                    <Text style = {styles.textBtnEntrada}>ENTRADA</Text>
                </TouchableOpacity> 
            </View>
			
		</ScrollView>

	</View>
    );
}

const styles = StyleSheet.create({
  entrada: {
    marginTop: 30,
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'stretch',
    backgroundColor: '#E5E5E5'
  },
  textEntrada: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  	viewDatos: {
		backgroundColor: '#fff',
		marginHorizontal: 25,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 20,
		marginBottom: 20,
	},  
	label: {
		fontWeight: 'bold',
		fontSize: 25,
	},
	input: {
		fontSize: 18
	},
	textBtnFechaHora: {
		textAlign: 'center',
		color: 'black',
		fontSize: 18,
		fontWeight: '600',
		marginTop: 15
	},
	textFecha: {
		textAlign: 'center',
		fontSize: 18,
		marginTop: 10
	},
	btnEntrada: {
		backgroundColor: 'black',
		paddingVertical: 10,
		marginBottom: 35,
		marginHorizontal: 40,
		borderRadius: 15,
	},
	textBtnEntrada: {
		textAlign: 'center',
		color: 'white'
	},   
});

export default Entry;