args = argv();
frequency = 0.1;
Tpc_array = [50];

FlagVP = 1;
Gtx = 0;
Grx = 0;
Hrg = 10;
Htg = str2double(args{6});
Phire = str2double(args{3});
Phirn = str2double(args{4});
Phite = str2double(args{1});
Phitn = str2double(args{2});
AdapterFrequency = str2double(args{7});
iterationNumber = args{8};
startVal = str2double(args{9});
endVal = str2double(args{10});
modulak = str2double(args{11});
globalCounter = str2double(args{12});
Tpc = 0.001;
Profile = 'Prof_b2iseac';
pyta = 0;
iterationCounter = 0;

try
    s = pwd;
    % pkg install -forge io;
    % pkg install -forge windows;
    pkg load io;
    pkg load windows;


    % if ~exist('prof_b2iseac2.m','file')
        addpath([s '/validation_results/'])
        addpath([s strcat('/validation_results/',args{5},'/')]);
    % end

    if ~exist('DigitalMaps_DN_Median.m','file')
        addpath([s '/octave-src/'])
    end

    if (isOctave)
        % pkg load windows;
        % pkg load io;
        page_screen_output(0);
        page_output_immediately(1);
    end


catch
    error('Folder ./octave-src/ does not appear to be on the MATLAB search path.');
end



     GHz = frequency;
     pg  = 'Page1';

     A = {'FlagVp', 'GHz', 'Grx', 'Grt', 'Hrg', 'Htg', 'Phire', 'Phirn',  'Phite', ...
    'Phitn', 'Tpc',	'Profile',	'FlagLos50', 'FlagLospa', 'FlagLosps', 'FlagSea', ...
    'FlagShort', 'A1', 'A2', 'A2r',	'A2t',	'Aac',	'Aad',	'dAat',	'Ags',	'Agsur', ...
    'Aorcv', 'Aos',	'Aosur', 'Aotcv', 'Awrcv',	'Awrrcv', 'Awrs', 'Awrsur',	'Awrtcv', ...
    'Aws', 'Awsur',	'Awtcv', 'Bt2rDeg',	'Cp', 'D',	'Dcr',	'Dct',	'Dgc',	'Dlm', ...
    'Dlr',	'Dlt',	'Drcv',	'Dtcv',	'Dtm',	'Foes1', 'Foes2', 'Fsea', 'Fwvr', 'Fwvrrx',	'Fwvrxt', ...
    'GAM1',	'GAM2',	'Gamo',	'Gamw',	'Gamwr', 'H1', 'Hcv', 'Hhi', 'Hlo',	'Hm', 'Hmid', ...
    'Hn', 	'Hrea',	'Hrep',	'Hrs',	'Hsrip',	'Hsripa',	'Hstip',	'Hstipa',	'Htea', ...
    'Htep',	'Hts',	'Lb',	'Lba',	'Lbes1',	'Lbes2',	'Lbfs',	'Lbm1',	'Lbm2',	'Lbm3',	...
    'Lbm4',	'Lbs',	'Ld',	'Ldba',	'Ldbka',    'Ldbks',	'Ldbs',	'dLdsph',	'Lp1r',	'Lp1t', ...
    'Lp2r',	'Lp2t',	'Mses',	'N',	'Nd1km50',	'Nd1kmp',	'Nd65m1',	'Nlr',	'Nlt',	'Nsrima',...
    'Nsrims',	'Nstima',	'Nstims',	'Phi1qe',	'Phi1qn',	'Phi3qe',	'Phi3qn',	'Phicve', ...
    'Phicvn',	'Phime',	'Phimn',	'Phircve',	'Phircvn',	'Phitcve',	'Phitcvn',	'Qoca', ...
    'Reff50',	'Reffp',	'Sp',	'Thetae',	'Thetar',	'Thetarpos',	'Thetas',	'Thetat', ...
    'Thetatpos',	'Tpcp',	'Tpcq',	'Tpcscale',	'Wave',	'Wvsur',	'WvSurrx',	'WvSurtx',	'Ztropo'};


     r1 = 1;


    % xlswrite(nazwaPliku, A, pg, "A1:EI1");
    % A={};
     for tpccnt = 1:length(Tpc_array)
        koncowy = endVal;
        if iterationNumber == 5
            koncowy = endVal + modulak;
        end
        disp(["start -> ", num2str(startVal), " end - >", num2str(koncowy)]);
        for iteration = startVal:koncowy
            % printf("---- %d", iteration);

            fName = strcat('prof_', num2str(iteration));
            funtionFromStr = str2func(['@(x,y,z)' fName]);
            Data_array = funtionFromStr();


            % disp(['pyta --- ', num2str(pyta)]);
            pyta=pyta+1;
            for index = 1:length(Data_array)

                retrieved = Data_array{index};

                d = retrieved(:,1);
                h = retrieved(:,2);
                z = retrieved(:,3);
                %[d,h,z]
                Tpc = Tpc_array(tpccnt);

                fNameRec = strcat('get_receivers', num2str(iteration));
                funtionFromStrReceiver = str2func(['@(x,y,z)' fNameRec]);
                ReceiversData = funtionFromStrReceiver();

                r1 = ReceiversData{index};
                % disp(["Rec ", num2str(r1),'fNameRec ', fNameRec  ])

                receiverLatitude = r1(:,1);
                receiverLongitude = r1(:,2);


                disp(['Processing ' num2str(pyta) '/' num2str(iteration) " " num2str(length(Tpc_array)) ', GHz = ' num2str(GHz) ' GHz, Lat = ' num2str(receiverLatitude) ' Lon = ', num2str(receiverLongitude)  ' Tpc = ' num2str(Tpc) ' ...']);

                p2001 = tl_p2001(d, h, z, GHz, Tpc_array(tpccnt), receiverLatitude, receiverLongitude, Phite, Phitn, Hrg, Htg, Grx, Gtx, FlagVP);
                row = [...
                    FlagVP, ...
                    GHz, ...
                    Grx, ...
                    Gtx, ...
                    Hrg, ...
                    Htg, ...
                    receiverLatitude, ...
                    receiverLongitude, ...
                    Phite, ...
                    Phitn, ...
                    Tpc, ...
                    Profile, ...
                    struct2cell(p2001).'
                    ];
                    % if(length(A) > 0)
                    A = [A; row];

                r1 = tpccnt + 1;
            end
        end
        % if pyta < step && pyta != 0
            disp(['Jest tu w pierwszym i A ------', num2str(length(A)), " pytka ", num2str(pyta)]);
            nazwaPliku = strcat('validation_results/',args{5},'/',args{5},'-',iterationNumber,"-",num2str(globalCounter),'.xlsx');
            xlswrite(nazwaPliku, A, pg);
            % xlswrite(nazwaPliku, A, pg, strcat('A2:EI', num2str(pyta + 2)));
            disp(['zapisał dane do enda ! ']);
        % else
        %     dividerLast = floor(pyta/step);
        %     disp(['Jest tu i A ------', length(A), " pytka ", pyta]);
        %     xlswrite(nazwaPliku, A, pg, strcat('A', num2str(dividerLast * step + 2),':EI', num2str(pyta + 2)));
        end
    %  end

printf("%s", "writing !!!!!!!!!!")

exit(0)