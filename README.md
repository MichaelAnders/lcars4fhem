# lcars4fhem
Easy and automated creation of a LCARS frontend for fhem

Note: The original code was not developed by me! I have taken the code which was last updated March 2015 from the FHEM forum and have uploaded it go GitHub to allow for a better collaboration. The original code can be found here: https://forum.fhem.de/index.php/topic,13070.0.html

Goal: Get the look and feel of LCARS (Star Trek) on your browser while having using FHEM (www.fhem.de) for house automation.

I love LCARS, and there are many threads in the above forum describing how to visualize things with floorplans. However, that is manual work and I like code which does it automatically - saves everyone wanting to have it a lot of time!

Therefore, what makes this pretty unique to my knowledge is:
- simple configuration of the data you want to visualize using a config.xml file
- automated layouting and rendering in the browser based on the config file
- automated updating of data based on defined intervals
- user interaction triggers changes in fhem 

To use the frontend:
1) clone or download the repository. The files have to be placed in the www folder of fhem, e.g. /opt/fhem/www. So you would have a folder /opt/fhem/www/lcars4fhem
2) change all the files to be readable (in the /opt/fhem/www/lcars4fhem folder enter "chmod 777 * -R" to let everyone read/write the files - make it more strict if you want to)
3) open the frontend e.g. via http://192.168.4.40:8083/fhem/lcars4fhem/index.html

You will probably not see much except buttons on the left and error messages when you click on an entry. To get working results, change the config.xml file:
The "hwid" for every device, e.g. "LivingRoom_LC", is the device ID in fhem. The reading is also from fhem. Make changes and retest (may require you to clear your browser cache).
