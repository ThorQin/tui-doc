package com.github.thorqin;


import com.github.thorqin.webapi.WebApplication;
import com.github.thorqin.webapi.annotation.UseDispatcher;
import com.github.thorqin.webapi.annotation.UseSecurity;

@UseSecurity
@UseDispatcher(value="/api/*")
public class Application extends WebApplication {
	@Override
	public void onStartup() {
		System.out.println("Application startupped.");
	}

	@Override
	public void onShutdown() {
		System.out.println("Application shutdown.");
	}
}
