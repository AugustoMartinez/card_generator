let bin = document.getElementById("bin");
let incluirFecha = document.getElementById("date");
let mes = document.getElementById("mes");
let anio = document.getElementById("anio");
let incluirCVV = document.getElementById("cvv");
let numCVV = document.getElementById("ncvv");
let cantidad = document.getElementById("cantidad");
let formato = document.getElementById("formato");
let generar = document.getElementById("generar");
let mostrar = document.getElementById("mostrar");
let mostrarTarjeta = document.getElementById("tarjetaVisualizar");
const apiBIN = "https://lookup.binlist.net";

incluirFecha.addEventListener("click", () => {
	mes.toggleAttribute("disabled");
	anio.toggleAttribute("disabled");
});

incluirCVV.addEventListener("click", () => {
	numCVV.toggleAttribute("disabled");
});

const completarConX = _bin => {
	let binGenerado = _bin;
	let i = 15;
	while (i >= binGenerado.length) {
		binGenerado += `x`;
	}
	
	return binGenerado;
};

const algoritmoLuhn = value =>{

	// accept only digits, dashes or spaces
		if (/[^0-9-\s]+/.test(value)) return false;
	
	// The Luhn Algorithm. It's so pretty.
		var nCheck = 0, nDigit = 0, bEven = false;
		value = value.replace(/\D/g, "");
	
		for (var n = value.length - 1; n >= 0; n--) {
			var cDigit = value.charAt(n),
				nDigit = parseInt(cDigit, 10);
	
			if (bEven) {
				if ((nDigit *= 2) > 9) nDigit -= 9;
			}
	
			nCheck += nDigit;
			bEven = !bEven;
		}
	
		return (nCheck % 10) == 0;

	
}


const randomPick = num => {
	return Math.floor(Math.random() * num);
};

const mesRandom = () => {
	let meses = [
		"01",
		"02",
		"03",
		"04",
		"05",
		"06",
		"07",
		"08",
		"09",
		"10",
		"11",
		"12",
	];
	return meses[randomPick(meses.length)];
};

const anioRandom = () => {
	let anios = [21, 22, 23, 24, 25, 26, 27, 28, 29];
	return anios[randomPick(anios.length)];
};

const generarCVV = (_numCVV, _bin) => {
	let cvvGenerado = _numCVV;
	let x = 2;
	if(_bin.substr(0,2)=="37" || _bin.substr(0,2)=="34"){
		while (3 >= cvvGenerado.length) {
			cvvGenerado += `${Math.floor(Math.random() * 10)}`;
		}
	}
	else{
		while (x >= cvvGenerado.length) {
			cvvGenerado += `${Math.floor(Math.random() * 10)}`;
		}
	}
	
	return cvvGenerado;
};

const generarNumTarjeta = _numBIN => {
	let binGenerado = _numBIN;
	let i = 15;
	while (i >= binGenerado.length) {
		binGenerado += `${Math.floor(Math.random() * 10)}`;
	}
	if(algoritmoLuhn(binGenerado)==true){
		return binGenerado;
	}
	else{
		return generarNumTarjeta(_numBIN);
	}
};

const generarJSON = (_bin, _mesElegido, _anioElegido, _cvv, _mostrarFecha, _mostrarCVV) => {
	return `Tarjeta de credito{
		"Numero de tarjeta": ${_bin},${_mostrarFecha==true ? `\n		"Fecha de vencimiento": "${_mesElegido}/${_anioElegido}",` : ``}${_mostrarCVV==true ? `\n		"CVV": ${_cvv},` : ""}
	}`;
};

const generarXML = (_bin, _mesElegido, _anioElegido, _cvv, _mostrarFecha, _mostrarCVV) => {
	return `<TarjetaDeCredito>
		<NumeroDeTarjeta>${_bin}</NumeroDeTarjeta>${_mostrarFecha==true ? `\n		<FechaDeVencimiento>${_mesElegido}/${_anioElegido}</FechaDeVencimiento>` : ""}${_mostrarCVV==true ? `\n		<CVV>${_cvv}</CVV>` : ""}
</TarjetaDeCredito>`;
};

const generarCSV = (_bin, _mesElegido, _anioElegido, _cvv, _mostrarFecha, _mostrarCVV) => {
	return `${_bin}, ${_mostrarFecha==true ? `${_mesElegido}/${_anioElegido}, ` : ""}${_mostrarCVV==true ? `${_cvv}` : ""}`;
};

const generarPipe = (_bin, _mesElegido, _anioElegido, _cvv, _mostrarFecha, _mostrarCVV) => {
	return `${_bin}|${_mostrarFecha==true ? `${_mesElegido}/${_anioElegido}|` : ""}${_mostrarCVV==true ? `${_cvv}` : ""}`;
};

generar.addEventListener("click", () => {
	mostrar.value = "";

	bin.value = completarConX(bin.value);
	let amexCVV = '';
	let binCompleto = 0;
	let mesElegido = "";
	let anioElegido = "";
	let cvv = 0;
	let vecesAImprimir = cantidad.value;

	fetch(`${apiBIN}/${bin.value.replace(/x/g,"")}`)
    .then((response) => response.json())
    .then((users) => mostrarTarjeta.innerHTML = `<div class="flex relative w-36">
	<span class="text-xs text-gray-400 absolute -mt-2">Scheme/Network</span>
	<div class="capitalize">${users.scheme}</div>
</div>
<div class="flex pl-2 relative">
	<span class="text-xs text-gray-400 absolute -mt-2">Type</span>
	<div class="capitalize">${users.type}</div>
</div>
<div class="flex pl-2 relative">
	<span class="text-xs text-gray-400 absolute -mt-2">Country</span>
	<div><span class="text-sm">${users.country.emoji}</span> ${users.country.name}</div>
</div>`);
	
console.log(amexCVV);
	switch (formato.value) {
		case "pipe":
			while (vecesAImprimir > 0) {
				if (mes.value == "random") {
					mesElegido = mesRandom();
				} else {
					mesElegido = mes.value;
				}

				if (anio.value == "random") {
					anioElegido = anioRandom();
				} else {
					anioElegido = anio.value;
				}
				
				binCompleto = generarNumTarjeta(bin.value.replace(/x/g,""));
				
				cvv = generarCVV(numCVV.value.replace(/x/g,""), bin.value.replace(/x/g,""));

				mostrar.value += `${generarPipe(
					binCompleto,
					mesElegido,
					anioElegido,
					cvv,
					incluirFecha.checked,
					incluirCVV.checked
				)} \n`;
				vecesAImprimir--;
			}
			break;
		case "json":
			mostrar.value += "{ \n";
			while (vecesAImprimir > 0) {
				if (mes.value == "random") {
					mesElegido = mesRandom();
				} else {
					mesElegido = mes.value;
				}

				if (anio.value == "random") {
					anioElegido = anioRandom();
				} else {
					anioElegido = anio.value;
				}

				binCompleto = generarNumTarjeta(bin.value.replace(/x/g,""));
				
				cvv = generarCVV(numCVV.value.replace(/x/g,""), bin.value.replace(/x/g,""));

				mostrar.value += `${generarJSON(
					binCompleto,
					mesElegido,
					anioElegido,
					cvv,
					incluirFecha.checked,
					incluirCVV.checked
				)} \n`;
				vecesAImprimir--;
			}
			mostrar.value += "}";
			break;
		case "csv":
			while (vecesAImprimir > 0) {
				if (mes.value == "random") {
					mesElegido = mesRandom();
				} else {
					mesElegido = mes.value;
				}

				if (anio.value == "random") {
					anioElegido = anioRandom();
				} else {
					anioElegido = anio.value;
				}
				
				binCompleto = generarNumTarjeta(bin.value.replace(/x/g,""));

				cvv = generarCVV(numCVV.value.replace(/x/g,""), bin.value.replace(/x/g,""));

				mostrar.value += `${generarCSV(
					binCompleto,
					mesElegido,
					anioElegido,
					cvv,
					incluirFecha.checked,
					incluirCVV.checked
				)} \n`;
				vecesAImprimir--;
			}
			break;
		case "xml":
			mostrar.value += "<xml>\n";
			while (vecesAImprimir > 0) {
				if (mes.value == "random") {
					mesElegido = mesRandom();
				} else {
					mesElegido = mes.value;
				}

				if (anio.value == "random") {
					anioElegido = anioRandom();
				} else {
					anioElegido = anio.value;
				}

				binCompleto = generarNumTarjeta(bin.value.replace(/x/g,""));

				cvv = generarCVV(numCVV.value.replace(/x/g,""), bin.value.replace(/x/g,""));

				mostrar.value += `${generarXML(
					binCompleto,
					mesElegido,
					anioElegido,
					cvv,
					incluirFecha.checked,
					incluirCVV.checked
				)} \n`;
				vecesAImprimir--;
			}
			mostrar.value += "</xml>";
			break;
	}
});

