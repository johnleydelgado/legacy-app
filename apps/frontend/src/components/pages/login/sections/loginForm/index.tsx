"use client"

import * as React from 'react';

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as z from "zod"

import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { handleSignIn } from "@/lib/cognito-actions";
import {formSchema} from "./formSchema";
import {CircleAlert} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "../../../../ui/alert";


const SignInPage = () => {
    const router = useRouter();
    const [data, dispatch, isPending] = React.useActionState(handleSignIn, undefined);
    const errorMessage = data?.error || null;

    // @ts-ignore
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            // rememberMe: false,
        },
    });

    React.useEffect(() => {
        if (data?.redirectUrl) {
            router.push(data.redirectUrl);
        }
    }, [data, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h1 className="text-3xl font-bold">Sign In</h1>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="icon" className="rounded-full" aria-label="Share on Facebook">
                            <FaFacebook className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full" aria-label="Share on Twitter">
                            <FaTwitter className="h-4 w-4 text-gray-400" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {(errorMessage) && (
                        <Alert className="border-red-500">
                            <CircleAlert color="red" />
                            <AlertTitle className="text-red-500">Error Login</AlertTitle>
                            <AlertDescription className="text-red-500">
                                {errorMessage || "Unidentified Error"}
                            </AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form action={dispatch} className="space-y-4">
                            {/*@ts-ignore*/}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase text-gray-700">Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Username" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase text-gray-700">Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Password" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit"
                                    className="w-full bg-gray-700 text-white hover:bg-gray-500 cursor-pointer"
                                    disabled={isPending}>
                                {isPending ? "Signing in..." : "Sign In"}
                            </Button>
                            <div className="flex items-center justify-between">
                                {/*<div className="flex items-center space-x-2">*/}
                                {/*    <FormField*/}
                                {/*        control={form.control}*/}
                                {/*        name="rememberMe"*/}
                                {/*        render={({ field }) => (*/}
                                {/*            <FormItem className="flex flex-row items-center space-x-2">*/}
                                {/*                <FormControl>*/}
                                {/*                    <Checkbox*/}
                                {/*                        checked={field.value || false}*/}
                                {/*                        onCheckedChange={field.onChange}*/}
                                {/*                        className="border-amber-400 text-amber-400"*/}
                                {/*                    />*/}
                                {/*                </FormControl>*/}
                                {/*                <label htmlFor="rememberMe" className="text-sm font-medium text-amber-400">*/}
                                {/*                    Remember Me*/}
                                {/*                </label>*/}
                                {/*            </FormItem>*/}
                                {/*        )}*/}
                                {/*    />*/}
                                {/*</div>*/}
                                {/*<Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">*/}
                                <Link href="javascript:void(0)" className="text-sm text-gray-500 hover:text-gray-700">
                                    Forgot Password
                                </Link>
                            </div>
                        </form>
                    </Form>

                    <div className="relative flex items-center justify-center">
                        <Separator className="absolute w-full" />
                        <span className="relative bg-white px-2 text-xs text-gray-500">OR</span>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        // onClick={handleGoogleSignIn}
                        disabled={isPending || true}>
                        <FaGoogle />
                        Sign in with Google
                    </Button>

                    <div className="text-center text-sm text-gray-500">
                        Not a member?{" "}
                        {/*<Link href="/sign-up" className="font-medium text-amber-400">*/}
                        <Link href="javascript:void(0)" className="font-medium text-gray-400 hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SignInPage;
