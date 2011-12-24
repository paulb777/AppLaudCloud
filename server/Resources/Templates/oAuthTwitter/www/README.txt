This demo app uses the PhoneGap Child Browser Plugin, and
can not currently be run as a project. It must be built and
downloaded to a device (apk file).

All of the following steps must be completed:

Instructions on installing and customizing OAuth Twitter Demo:

1. Add to res/xml/plugins.xml (inside 'plugins' tag):

    <plugin name="ChildBrowser" value="com.phonegap.plugins.childBrowser.ChildBrowser"/>

2. Move the directory and files in phonegap/ under directory com/ shown below:
	   <project_name>/assets/www/com/phonegap/plugins/childBrowser/childBrowser.java
   to:
       <project_name>/src/com/ 

   so that final directory looks like:
       <project_name>/src/com/phonegap/plugins/childBrowser/childBrowser.java
   
3. Advisable to edit AndroidManifest.xml to include only these permissions:

    <uses-permission android:name="android.permission.INTERNET" />  
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

4. For more details on writing an app including Twitter REST API:
 
     http://www.mobiledevelopersolutions.com/home/start/twominutetutorials/tmt5p1
   
   The above includes information on registering you app with twitter (required).
   
   Search "YOUR-" and "your-" in main.js to find places you must change to your 
   own Twitter info and app callback url.
