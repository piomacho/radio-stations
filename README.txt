P2001 Version 3 (28.04.18)

Validation examples of Recommendation ITU-R P.2001-2

GENERAL NOTES
--------------

Files and subfolders in the distribution .zip package.

 validate_p2001_b2iseac.m   - MATLAB scripts used to validate the implementation of Recommendation ITU-R P.2001-2
 validate_p2001_prof4.m       as defined in the file tl_p2001.m using a set of test terrain profiles provided in
                              the folder ./validation_results/

 ./validation_examples/     - Folder containing validation examples for Recommendation ITU-R P.2001-2

 ./validation_results/      - Folder containing the results of the validation tests using tl_p2001.m on the terrain
                              profiles that corespond to the profiles defined in ./validation_examples/
                              
                              
Please note that to reproduce the ./validation_results/ the MATLAB implementation of Recommendation ITU-R P.2001-2:
                              
 tl_p2001.m                 - MATLAB function implementing Recommendation ITU-R P.2001-2                              

 ./src/	                    - Folder containing the functions used by tl_p2001.m and validate_p2001*.m
 
is required (available from the ITU-R Study Group 3 website on software, data and validation examples).  The relative 
subfolder structure needs to be observed when running the validate_p2001_b2iseac.m and validate_p2001_prof4.m scripts.

UPDATES AND FIXES
-----------------
Version 3 (28.06.18)
        - Corrections according to feedback obtained from CG 3J-3M-13:
            - Declared empty arrays G and P for no-rain path (precipitation_fade_initial.m)
            - Introduced additional validation checks for input arguments  

Version 2 (11.08.17)
        - Corrected a bug (typo) in dl_bull_smooth
        - Replaced load function calls to increase computational speed
        - Introduced a validation example for mixed paths (validate_p2001_b2iseac.m)

Version 1 (29.06.16)
        - Initial implementation