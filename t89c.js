// this is a partial port of Paul O'Brien's (Paul.OBrien@aero.org) 2003 matlab port of
// Tsyganenko's External Field Model, 1989 Version (T89) by N.A. Tsyganenko [Nikolai.Tsyganenko@gsfc.nasa.gov])
// it was very sloppily done, many unused functions and variables were cut. I assume many bugs were added.
// Do not use for any sort of simulation that is supposed to be accurate!

var makeT89C = function(){

    var param = [
        [0.,       0.,      0.,     0.,   0., 0., 0., 0. ],
        [0.,  -116.53, -55.553, -101.34, -181.69, -436.54, -707.77, -1190.4],
        [0.,   -10719,  -13198,  -13480,  -12320, -9001.0, -4471.9,  2749.9],
        [0.,   42.375,  60.647,  111.35,  173.79,  323.66,  432.81,  742.56],
        [0.,   59.753,  61.072,  12.386, -96.664, -410.08, -435.51, -1110.3],
        [0.,   -11363,  -16064,  -24699,  -39051,  -50340,  -60400,  -77193],
        [0.,   1.7844,  2.2534,  2.6459,  3.2633,  3.9932,  4.6229,  7.6727],
        [0.,   30.268,  34.407,  38.948,  44.968,  58.524,  68.178,  102.05],
        [0., -0.035372, -0.038887, -0.034080, -0.046377, -0.038519, -0.088245, -0.096015],
        [0., -0.066832, -0.094571, -0.12404, -0.16686, -0.26822, -0.21002, -0.74507],
        [0., 0.016456, 0.027154, 0.029702, 0.048298, 0.074528, 0.11846, 0.11214],
        [0.,  -1.3024, -1.3901, -1.4052, -1.5473, -1.4268, -2.6711, -1.3614],
        [0., 0.0016529, 0.0013460, 0.0012103, 0.0010277, -0.0010985, 0.0022305, 0.0015157],
        [0., 0.0020293, 0.0013238, 0.0016388, 0.0031632,  0.0096613, 0.010910, 0.022283],
        [0.,   20.289,  23.005,  24.490,  27.341,  27.557,   27.547,  23.164],
        [0., -0.025203, -0.030565, -0.037705, -0.050655, -0.056522, -0.054080, -0.074146],
        [0.,   224.91,  55.047, -298.32, -514.10, -867.03, -424.23, -2219.1],
        [0.,  -9234.8, -3875.7,  4400.9,   12482,   20652,  1100.2,  48253.],
        [0.,   22.788,  20.178,  18.692,  16.257,  14.101,  13.954,  12.714],
        [0.,   7.8813,  7.9693,  7.9064,  8.5834,  8.3501,  7.5337,  7.6777],
        [0.,   1.8362,  1.4575,  1.3047,  1.0194, 0.72996, 0.89714, 0.57138],
        [0., -0.27228, 0.89471,  2.4541,  3.6148,  3.8149,  3.7813,  2.9633],
        [0.,   8.8184,  9.4039,  9.7012,  8.6042,  9.2908,  8.2945,  9.3909],
        [0.,   2.8714,  3.5215,  7.1624,  5.5057,  6.4674,  5.1740,  9.7263],
        [0.,   14.468,  14.474,  14.288,  13.778,  13.729,  14.213,  11.123],
        [0.,   32.177,  36.555,  33.822,  32.373,  28.353,  25.237,  21.558],
        [0.,   0.0100,  0.0100,  0.0100,  0.0100,  0.0100,  0.0100,  0.0100],
        [0.,   0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000],
        [0.,   7.0459,  7.0787,  6.7442,  7.3195,  7.4237,  7.0037,  4.4518],
        [0.,   4.0000,  4.0000,  4.0000,  4.0000,  4.0000,  4.0000,  4.0000],
        [0.,   20.000,  20.000,  20.000,  20.000,  20.000,  20.000,  0.0000] ];
    var G, RC, D0, DD, HA02, ADR, DEL, DT, GAM, SX;
    var HXLD2M, HXLW2M, P, Q, DBLDEL, AT;
    var RDYC2, HLWC2M, DRDYC2, DX, SXA, SYA, SZA;
    var W1, W2, W3, W4, W5, W6;
    var AK1, AK2, AK3, AK4, AK5;
    var AK6, AK7, AK8, AK9, AK10;
    var AK11, AK12, AK13, AK14, AK15;
    var AK16, AK17, AK610, AK711, AK812, AK913;

    var t89_t89 = function t89_t89(id,a,xi){



        var DER = [[],[],[],[]]; // 3,30
        var A02 = 25;
        var XLW2 = 170;
        var YN = 30;
        var RPI = 0.31830989;
        var RT = 30;
        var XD = 0;
        var XLD2 = 40;
        var SXC = 4;
        var XLWC2 = 50;
        var DXL = 20;
        var ADSL=0;
        var XGHS=0;
        var H=0;
        var HS=0;
        var GAMH=0;

        if (id===1)
        {
            for( var _i= 0; _i<=30;_i++)
            {
                for( var _l= 0;_l<=3;_l++)
                {
                    DER[_l][_i] = 0;
                }
            }
            var DYC=a[30];
            var DYC2=DYC*DYC;
            DX=a[18];
            HA02=0.5*A02;
            //  var RDX2M = -1/(DX*DX);
            //	var RDX2 = -RDX2M;
            RDYC2=1/DYC2;
            HLWC2M=-0.5*XLWC2;
            DRDYC2=-2*RDYC2;
            //	var DRDYC3=2*RDYC2 * Math.sqrt(RDYC2);
            HXLW2M = -0.5*XLW2;
            ADR=a[19];
            D0=a[20];
            DD=a[21];
            RC=a[22];
            G=a[23];
            AT=a[24];
            DT=D0;
            DEL=a[26];
            P=a[25];
            Q=a[27];
            SX=a[28];
            GAM=a[29];
            HXLD2M=-0.5*XLD2;

            W1=-0.5/DX;
            DBLDEL=2*DEL;
            W2=W1*2;
            W4=-1/3;
            W3=W4/DX;
            W5=-0.5;
            W6=-3;
            AK1=a[1];
            AK2=a[2];
            AK3=a[3];
            AK4=a[4];
            AK5=a[5];
            AK6=a[6];
            AK7=a[7];
            AK8=a[8];
            AK9=a[9];
            AK10=a[10];
            AK11=a[11];
            AK12=a[12];
            AK13=a[13];
            AK14=a[14];
            AK15=a[15];
            AK16=a[16];
            AK17=a[17];
            SXA=0;
            SYA=0;
            SZA=0;
            AK610=AK6*W1+AK10*W5;
            AK711=AK7*W2-AK11;
            AK812=AK8*W2+AK12*W6;
            AK913=AK9*W3+AK13*W4;
        }

        var X  = xi[0];
        var Y  = xi[1];
        var Z  = xi[2];
        var TILT=xi[3];
        var TLT2=TILT*TILT;
        var SPS = Math.sin(TILT);
        var CPS = Math.sqrt (1 - (SPS *SPS));

        var X2=X*X;
        var Y2=Y*Y;
        var Z2=Z*Z;
        var TPS=SPS/CPS;
        var HTP=TPS*0.5;
//		var GSP=G*SPS;
        var XSM=X*CPS-Z*SPS;
        var ZSM=X*SPS+Z*CPS;

        var XRC=XSM+RC;
        var XRC16=XRC*XRC+16;
        var SXRC=Math.sqrt(XRC16);
        var Y4=Y2*Y2;
        var Y410=Y4+1e4;
        var SY4=SPS/Y410;
        var GSY4=G*SY4;
        var ZS1=HTP*(XRC-SXRC);
        var DZSX=-ZS1/SXRC;
        var ZS=ZS1-GSY4*Y4;
        var D2ZSGY=-SY4/Y410*4e4*Y2*Y;
        var DZSY=G*D2ZSGY;

        var XSM2=XSM*XSM;
        var DSQT= Math.sqrt(XSM2+A02);
        var FA0=0.5*(1+XSM/DSQT);
        var DDR=D0+DD*FA0;
        var DFA0=HA02/(DSQT*DSQT*DSQT);
        var ZR=ZSM-ZS;
        var TR=Math.sqrt((ZR*ZR)+(DDR*DDR));
        var RTR=1/TR;
        var RO2=XSM2+Y2;
        var ADRT=ADR+TR;
        var ADRT2=ADRT*ADRT;
        var FK=1/(ADRT2+RO2);
        var DSFC=Math.sqrt(FK);
        var FC=FK*FK*DSFC;
        var FACXY=3.0*ADRT*FC*RTR;
        var XZR=XSM*ZR;
        var YZR=Y*ZR;
        var DBXDP=FACXY*XZR;
        DER[2][5]=FACXY*YZR;
        var XZYZ=XSM*DZSX+Y*DZSY;
        var FAQ=ZR*XZYZ-DDR*DD*DFA0*XSM;
        var DBZDP=FC*(2*ADRT2-RO2)+FACXY*FAQ;
        DER[1][5]=DBXDP*CPS+DBZDP*SPS;
        DER[3][5]=DBZDP*CPS-DBXDP*SPS;

        var DELY2=DEL*Y2;
        var D=DT+DELY2;
        if(Math.abs(GAM) >= 1e-6)
        {
            var XXD=XSM-XD;
            var RQD=1/(XXD*XXD+XLD2);
            var RQDS = Math.sqrt(RQD);
            H=0.5*(1+XXD*RQDS);
            HS=-HXLD2M*RQD*RQDS;
            GAMH=GAM*H;
            D=D+GAMH;
            XGHS=XSM*GAM*HS;
            ADSL=-D*XGHS;
        }
        var D2=D*D;
        var T=Math.sqrt(ZR*ZR+D2);
        var XSMX=XSM-SX;
        var RDSQ2=1/(XSMX*XSMX+XLW2);
        var RDSQ=Math.sqrt(RDSQ2);
        var V=0.5*(1-XSMX*RDSQ);
        var DVX=HXLW2M*RDSQ*RDSQ2;
        var OM=Math.sqrt(Math.sqrt(XSM2+16)-XSM);
        var OMS=-OM/(OM*OM+XSM)*0.5;
        var RDY=1/(P+Q*OM);
        var OMSV=OMS*V;
        var RDY2=RDY*RDY;
        var FY=1/(1+Y2*RDY2);
        var W=V*FY;
        var YFY1=2*FY*Y2*RDY2;
        var FYPR=YFY1*RDY;
        var FYDY=FYPR*FY;
        var DWX=DVX*FY+FYDY*Q*OMSV;
        var YDWY=-V*YFY1*FY;
        var DDY=DBLDEL*Y;
        var ATT=AT+T;
        var S1=Math.sqrt(ATT*ATT+RO2);
        var F5=1/S1;
        var F7=1/(S1+ATT);
        var F1=F5*F7;
        var F3=F5*F5*F5;
        var F9=ATT*F3;
        var FS=ZR*XZYZ-D*Y*DDY+ADSL;
        var XDWX=XSM*DWX+YDWY;
        var RTT=1/T;
        var WT=W*RTT;
        var BRRZ1=WT*F1;
        var BRRZ2=WT*F3;
        var DBXC1=BRRZ1*XZR;
        var DBXC2=BRRZ2*XZR;
        DER[2][1]=BRRZ1*YZR;
        DER[2][2]=BRRZ2*YZR;
        DER[2][16]=DER[2][1]*TLT2;
        DER[2][17]=DER[2][2]*TLT2;
        var WTFS=WT*FS;
        var DBZC1=W*F5+XDWX*F7+WTFS*F1;
        var DBZC2=W*F9+XDWX*F1+WTFS*F3;
        DER[1][1]=DBXC1*CPS+DBZC1*SPS;
        DER[1][2]=DBXC2*CPS+DBZC2*SPS;
        DER[3][1]=DBZC1*CPS-DBXC1*SPS;
        DER[3][2]=DBZC2*CPS-DBXC2*SPS;
        DER[1][16]=DER[1][1]*TLT2;
        DER[1][17]=DER[1][2]*TLT2;
        DER[3][16]=DER[3][1]*TLT2;
        DER[3][17]=DER[3][2]*TLT2;

        var ZPL=Z+RT;
        var ZMN=Z-RT;
        var ROGSM2=X2+Y2;
        var SPL=Math.sqrt(ZPL*ZPL+ROGSM2);
        var SMN=Math.sqrt(ZMN*ZMN+ROGSM2);
        var XSXC=X-SXC;
        var RQC2=1/(XSXC*XSXC+XLWC2);
        var RQC=Math.sqrt(RQC2);
        var FYC=1/(1+Y2*RDYC2);
        var WC=0.5*(1-XSXC*RQC)*FYC;
        var DWCX=HLWC2M*RQC2*RQC*FYC;
        var DWCY=DRDYC2*WC*FYC*Y;
        var SZRP=1/(SPL+ZPL);
        var SZRM=1/(SMN-ZMN);
        var XYWC=X*DWCX+Y*DWCY;
        var WCSP=WC/SPL;
        var WCSM=WC/SMN;
        var FXYP=WCSP*SZRP;
        var FXYM=WCSM*SZRM;
        var FXPL=X*FXYP;
        var FXMN=-X*FXYM;
        var FYPL=Y*FXYP;
        var FYMN=-Y*FXYM;
        var FZPL=WCSP+XYWC*SZRP;
        var FZMN=WCSM+XYWC*SZRM;
        DER[1][3]=FXPL+FXMN;
        DER[1][4]=(FXPL-FXMN)*SPS;
        DER[2][3]=FYPL+FYMN;
        DER[2][4]=(FYPL-FYMN)*SPS;
        DER[3][3]=FZPL+FZMN;
        DER[3][4]=(FZPL-FZMN)*SPS;

        var EX=Math.exp(X/DX);
        var EC=EX*CPS;
        var ES=EX*SPS;
        var ECZ=EC*Z;
        var ESZ=ES*Z;
        var ESZY2=ESZ*Y2;
        var ESZZ2=ESZ*Z2;
        var ECZ2=ECZ*Z;
        var ESY=ES*Y;
        DER[1][6]=ECZ;
        DER[1][7]=ES;
        DER[1][8]=ESY*Y;
        DER[1][9]=ESZ*Z;
        DER[2][10]=ECZ*Y;
        DER[2][11]=ESY;
        DER[2][12]=ESY*Y2;
        DER[2][13]=ESY*Z2;
        DER[3][14]=EC;
        DER[3][15]=EC*Y2;
        DER[3][6]=ECZ2*W1;
        /*DER[3][10]=ECZ2*W5;
         DER[3][7]=ESZ*W2;
         DER[3][11]=-ESZ;
         DER[3][8]=ESZY2*W2;
         DER[3][12]=ESZY2*W6;
         DER[3][9]=ESZZ2*W3;
         DER[3][13]=ESZZ2*W4;*/
        var SX1=AK6*DER[1][6]+AK7*DER[1][7]+AK8*DER[1][8]+AK9*DER[1][9];
        var SY1=AK10*DER[2][10]+AK11*DER[2][11]+AK12*DER[2][12]+AK13*DER[2][13];
        var SZ1=AK14*DER[3][14]+AK15*DER[3][15]+AK610*ECZ2+AK711*ESZ+AK812
            *ESZY2+AK913*ESZZ2;
        var BXCL=AK3*DER[1][3]+AK4*DER[1][4];
        var BYCL=AK3*DER[2][3]+AK4*DER[2][4];
        var BZCL=AK3*DER[3][3]+AK4*DER[3][4];
        var BXT=AK1*DER[1][1]+AK2*DER[1][2]+BXCL +AK16*DER[1][16]+AK17*DER[1][17];
        var BYT=AK1*DER[2][1]+AK2*DER[2][2]+BYCL +AK16*DER[2][16]+AK17*DER[2][17];
        var BZT=AK1*DER[3][1]+AK2*DER[3][2]+BZCL +AK16*DER[3][16]+AK17*DER[3][17];
        var R_x=BXT+AK5*DER[1][5]+SX1+SXA;
        var R_y =BYT+AK5*DER[2][5]+SY1+SYA;
        var R_z=BZT+AK5*DER[3][5]+SZ1+SZA;


        return {
            f: [ R_x,R_y,R_z]
        };
    };

    var iop, id, a=[];
//                   3      []   0
    return function( iopt,parmod,ps,x,y,z ){

        //	if(Math.abs(x) > 70 || Math.abs(y) > 70 || Math.abs(z) > 70 )
        //	return{bx:0,by:0,bz:0}
        if(iop === undefined )
            iop = 10;

        if( iopt !== iop )
        {
            id=1;
            iop=iopt;
            for( var _index = 0; _index < 31; _index++ )
            {
                a.push( param[_index][iopt] );
            }
        }

        var xi = [x,y,z,ps];
        var result = t89_t89(id,a,xi);
        if( id === 1 )
            id = 2;
        return {
            bx: result.f[0],
            by: result.f[1],
            bz: result.f[2]
        };
    };
};
