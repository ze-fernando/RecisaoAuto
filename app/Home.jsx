import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, TouchableOpacity, ScrollView, } from 'react-native';
import { CustomInput } from './components/CustomInput';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';


export default function Home() {
    const [empregador, setEmpregador] = useState('');
    const [empregado, setEmpregado] = useState('');
    const [entrada, setEntrada] = useState('');
    const [saida, setSaida] = useState('');
    const [motivo, setMotivo] = useState('');
    const [salario, setSalario] = useState('');

    const [campos, setCampos] = useState([]);

    const [total, setTotal] = useState('');

    const adicionarCampo = () => {
        setCampos([...campos, {
            id: Date.now().toString(),
            checked: false,
            titulo: '',
            valor: ''
        }]);
    };

    const removerCampo = (id) => {
        const filteredCampos = campos.filter(c => c.id !== id);
        setCampos(filteredCampos);
    };

    const generatePdf = async () => {
        console.log("html")
        const htmlString = await generateRescisaoHTML({
            empregador,
            empregado,
            entrada,
            saida,
            motivo,
            salario,
            campos
        });
        console.log("file")

        const file = await printToFileAsync({
            html: htmlString,
            base64: false
        });

        await shareAsync(file.uri)
    };

    const generateRescisaoHTML = async ({ empregador, empregado, entrada, saida, motivo, salario, campos }) => {
        const formatCurrency = (value) => {
            if (!value) return 'R$ 0,00';
            const number = typeof value === 'string'
                ? parseFloat(value.replace(/\D/g, '')) / 100
                : value;
            return number.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        };

        const generateItens = () => {
            return campos.map((campo, index) => {
                const isSubtotal = /^sub[\s-]?total$/i.test(campo.titulo?.trim() || '');
                const isNegative = campo.valor < 0;

                const rowStyle = isSubtotal
                    ? `${htmlStyles.itemRow}; font-weight: bold; margin-top: 20px;`
                    : isNegative
                        ? `${htmlStyles.itemRow}; margin-bottom: 20px;`
                        : htmlStyles.itemRow;

                const valueStyle = isSubtotal
                    ? `${htmlStyles.totalValue}; font-size: 14px;`
                    : htmlStyles.value;

                return `
      <div style="${rowStyle}">
        <span>${campo.titulo || `Item ${index + 1}`}</span>
        <span style="${valueStyle}">${isNegative && '-'} ${formatCurrency(campo.valor)}</span>
      </div>
    `;
            }).join('');
        };

        // HTML completo
        const html = `
          <div style="${htmlStyles.container}">
            <h1 style="${htmlStyles.title}">Cálculos Rescisórios</h1>
            
            <div style="${htmlStyles.infoSection}">
            <p style="${htmlStyles.emphasis}"><strong>Empregador:</strong> ${empregador || 'Não informado'}</p>
              <p style="${htmlStyles.emphasis}"><strong>Empregado:</strong> ${empregado || 'Não informado'}</p>
              <p style="${htmlStyles.emphasis}"><strong>Período:</strong> ${entrada || '__/__/____'} a ${saida || '__/__/____'}</p>
              <p style="${htmlStyles.emphasis}"><strong>Motivo da saída:</strong> ${motivo || 'Não informado'}</p>
              <p style="${htmlStyles.emphasis}"><strong>Salário:</strong> ${salario ? formatCurrency(salario) : 'R$ 0,00'}</p>
            </div>
      
            <div style="${htmlStyles.calculosSection}">
              ${generateItens()}

              <!-- Total -->
              <div style="${htmlStyles.totalRow}">
                <strong>Valor a receber:</strong>
                <strong style="${htmlStyles.totalValue}">R$ ${total}</strong>
              </div>
            </div>
          </div>
        `;

        return html;
    };

    const htmlStyles = {
        container: `
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        `,
        title: `
          text-align: center;
          color: #0c1d47;
          margin-bottom: 20px;
        `,
        infoSection: `
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        `,
        emphasis: `
          margin: 8px 0;
          font-size: 16px;
        `,
        calculosSection: `
          width: 100%;
        `,
        itemRow: `
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding-bottom: 5px;
          border-bottom: 1px dashed #eee;
        `,
        value: `
          text-align: right;
          min-width: 120px;
        `,
        totalRow: `
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 2px solid #0c1d47;
          font-size: 18px;
        `,
        totalValue: `
          color: #0c1d47;
          font-weight: bold;
        `
    };

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollContainer}
        >
            <View style={styles.header}>
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: '0%', marginRight: '4%' }}
                    onPress={() => generatePdf()}>
                    <MaterialIcons name="picture-as-pdf" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Recisão Automática</Text>
            </View>

            <View style={styles.containerInput}>
                <CustomInput placeholder="Empregador" style={{ width: '90%' }} value={empregador} onChangeText={setEmpregador} type='text' />
                <CustomInput placeholder="Empregado" style={{ width: '90%' }} value={empregado} onChangeText={setEmpregado} type='text' />

                <View style={styles.boxInput}>
                    <CustomInput placeholder="Data Entrada" style={{ width: '45%' }} value={entrada} onChangeText={setEntrada} type='date' />
                    <CustomInput placeholder="Data Saída" style={{ width: '45%' }} value={saida} onChangeText={setSaida} type='date' />
                </View>

                <View style={styles.boxInput}>
                    <CustomInput placeholder="Motivo" style={{ width: '45%' }} value={motivo} onChangeText={setMotivo} type='text' />
                    <CustomInput placeholder="Salário" style={{ width: '45%' }} value={salario} onChangeText={setSalario} type='numeric' />
                </View>
            </View>

            <View style={styles.tableContainer}>
                {campos.map((campo, index) => (
                    <View key={campo.id} style={styles.row}>
                        <CustomInput
                            placeholder="Nome"
                            style={styles.inputField}
                            value={campo.titulo}
                            onChangeText={(text) => {
                                const novosCampos = [...campos];
                                novosCampos[index].titulo = text;
                                setCampos(novosCampos);
                            }}
                        />
                        <CustomInput
                            placeholder="Valor"
                            style={styles.inputField}
                            value={campo.valor}
                            type='numeric'
                            onChangeText={(text) => {
                                const novosCampos = [...campos];
                                novosCampos[index].valor = text;
                                setCampos(novosCampos);
                            }}
                        />

                        <TouchableOpacity onPress={() => removerCampo(campo.id)}>
                            <MaterialIcons name="delete-forever" size={24} color="#ad170f" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <CustomInput placeholder="Valor total" style={{ width: '90%', marginVertical: 10 }} value={total} onChangeText={setTotal} type='numeric' />

            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={styles.button} onPress={adicionarCampo}>
                    <Text style={styles.textButton}>+ Adicionar campo</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: '8%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    header: {
        backgroundColor: "#0c1d47",
        width: '100%',
        height: 125,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        color: 'white',
    },
    containerInput: {
        width: '100%',
        justifyContent: 'center',

        alignContent: 'center',
        marginTop: '10%',
        columnGap: 5,
        rowGap: 20,
        paddingBottom: 15,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
    },
    boxInput: {
        flexDirection: 'row',
        width: '90%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
    },
    scrollContainer: {
        width: '100%',
        flex: 1,
    },
    scrollContent: {
        minHeight: '45%'
    },
    tableContainer: {
        marginVertical: '3%',
        width: '90%',
        alignSelf: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    inputField: {
        width: '45%',
    },
    button: {
        width: '90%',
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0c1d47',
        marginBottom: 10,
    },
    textButton: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17
    }
});