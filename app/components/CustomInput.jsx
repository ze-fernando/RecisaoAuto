import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

export const CustomInput = ({ placeholder, style, value, onChangeText, type }) => {
    return (
        <View style={[styles.inputContainer, style]}>
            {value === '' && <Text style={styles.placeholder}>{placeholder}</Text>}
            <TextInput
                style={styles.input}
                value={value}
                keyboardType={type || 'default'}
                onChangeText={onChangeText}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        alignSelf: 'center',
    },
    placeholder: {
        position: 'absolute',
        top: 10,
        left: 10,
        color: '#ececec',
        fontWeight: 'bold',
        zIndex: 1,
    },
    input: {
        backgroundColor: '#606060',
        borderRadius: 4,
        paddingHorizontal: 10,
        height: 40,
        color: '#fff',
    },
});
