package com.github.thorqin;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import com.github.thorqin.webapi.WebLauncher;
import com.github.thorqin.webapi.annotation.UseDispatcher;
import com.github.thorqin.webapi.annotation.UseSecurity;

@UseDispatcher(
	value="/api/*", 
	monitor="/WEB-INF/classes/ssi", 
	publish="/")
@UseSecurity
public class Launcher implements WebLauncher {
	@Override
	public void onStartup(ServletContext servletContext) 
			throws ServletException {
	}
}
